import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

// ==========================================
// CONFIGURATION
// ==========================================
const BATCH_SIZE = 10;
const SLEEP_BETWEEN_BATCHES_MS = 10000;
const RETRY_DELAY_ON_429_MS = 60000;
const ROW_LIMIT = 500; // 408 for 999?
const DATA_DIR = path.resolve(process.cwd(), '../data'); 

// ==========================================
// HELPERS
// ==========================================
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// In-process global because creating GenerativeModel is cheap, 
// but we want to check API key once.
const apiKey = process.env.EMBEDDING_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function generateEmbeddingWithRetry(text: string): Promise<number[] | null> {
  if (!genAI) {
    console.error('❌ EMBEDDING_API_KEY is missing.');
    return null;
  }

  const model = genAI.getGenerativeModel({ model: process.env.EMBEDDING_MODEL || 'text-embedding-004' });

  // Simple exponential backoff or strict 429 logic
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error: any) {
      if (error.response?.status === 429 || error.message?.includes('429')) {
        console.warn(`⚠️  Rate limit (429) hit. Sleeping for ${RETRY_DELAY_ON_429_MS / 1000}s...`);
        await sleep(RETRY_DELAY_ON_429_MS);
        attempts++;
        continue;
      }
      console.error('❌ Embedding error:', error.message);
      return null;
    }
  }
  return null;
}

// ==========================================
// DATA LOADERS
// ==========================================
async function loadJson(filename: string): Promise<string[]> {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  // Normalization Rule: "Question: X? Answer: Y."
  // Assuming structure based on filename
  if (filename === 'clinic_faq.json' || filename === 'intents.json') {
     let items = data;
     // Handle { intents: [...] } wrapper for intents.json
     if (data.intents && Array.isArray(data.intents)) {
        items = data.intents;
     }

     // Check if it's an array
     if (Array.isArray(items)) {
        return items.map((item: any) => {
            // Adjust key access based on actual JSON structure. 
            // Assuming generic keys like "question"/"answer" or similar.
            // For intents.json: patterns is array, responses is array.
            
            let q = item.question || item.intent || item.query || '';
            let a = item.answer || item.response || item.text || '';

            // intents.json: taking first pattern and first response
            if (item.patterns && Array.isArray(item.patterns)) q = item.patterns[0];
            if (item.responses && Array.isArray(item.responses)) a = item.responses[0];

            if (q && a) return `Question: ${q}? Answer: ${a}.`;
            return JSON.stringify(item);
        });
     }
  }
  return [];
}

async function loadCsv(filename: string, limit: number | null = null): Promise<string[]> {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return [];
  }

  const results: string[] = [];
  let count = 0;

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (limit !== null && count >= limit) {
          // Destroy stream to stop reading
          stream.destroy(); 
          return;
        }

        // Normalization
        // Drugs CSV: "Drug Name" + "Side Effects"
        if (filename.includes('drugs_side_effects')) {
             const name = row['Drug Name'] || row['drug_name'] || '';
             const effects = row['Side Effects'] || row['side_effects'] || '';
             if (name && effects) {
                 results.push(`Drug ${name} causes side effects ${effects}.`);
             }
        } 
        // MedQuad CSV
        else if (filename.includes('medquad')) {
             // Depending on MedQuad structure (Question/Answer usually)
             const q = row['question'] || row['Question'] || '';
             const a = row['answer'] || row['Answer'] || '';
             if (q && a) {
                 results.push(`Question: ${q}? Answer: ${a}.`);
             }
        }
        // Mental Health FAQ CSV
        else {
             const q = row['Questions'] || row['Question'] || '';
             const a = row['Answers'] || row['Answer'] || '';
             if (q && a) {
                 results.push(`Question: ${q}? Answer: ${a}.`);
             }
        }

        count++;
      })
      .on('end', () => resolve(results))
      .on('close', () => resolve(results)) // Called when destroy() is used
      .on('error', (err) => reject(err));
  });
}

// ==========================================
// EMBEDDING INGESTION
// ==========================================
async function processAndSeedDocuments(
  sourceName: string, 
  texts: string[]
) {
  if (texts.length === 0) {
    console.log(`ℹ️  No data found for ${sourceName}`);
    return;
  }
  console.log(`🚀 Processing ${texts.length} items from ${sourceName}...`);

  // Process in batches
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    
    // Resume Logic: Skip if partial batch already exists
    // We check the first item of the batch. If it exists in DB with same source, we assume batch is done.
    // This is an approximation but good enough for sequential seed resumption.
    const firstItemText = batch[0];
    const exists = await prisma.$queryRaw`
        SELECT id FROM "documents" 
        WHERE "source" = ${sourceName} AND "content" = ${firstItemText}
        LIMIT 1
    `;
    
    if (Array.isArray(exists) && exists.length > 0) {
        console.log(`   ⏭️  Skipping Batch ${Math.floor(i / BATCH_SIZE) + 1} (Already exists)`);
        continue;
    }

    // Process batch in parallel (embedding calls)
    const promises = batch.map(async (text) => {
      const embedding = await generateEmbeddingWithRetry(text);
      return { text, embedding };
    });

    const results = await Promise.all(promises);

    // Save to DB
    for (const res of results) {
       if (res.embedding) {
          const id = uuidv4();
          // Use raw query for vector support in Prisma
          // Cast embedding array to vector using ::vector
          const embeddingString = `[${res.embedding.join(',')}]`;
          
          await prisma.$executeRaw`
            INSERT INTO "documents" ("id", "content", "source", "embedding")
            VALUES (${id}, ${res.text}, ${sourceName}, ${embeddingString}::vector)
            ON CONFLICT ("id") DO NOTHING;
          `;
       }
    }

    console.log(`   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} processed.`);
    
    // Safety Sleep
    if (i + BATCH_SIZE < texts.length) {
       console.log(`   💤 Sleeping for ${SLEEP_BETWEEN_BATCHES_MS / 1000}s to respect rate limits...`);
       await sleep(SLEEP_BETWEEN_BATCHES_MS);
    }
  }
  console.log(`🏁 Finished ${sourceName}`);
}

async function ingestData() {
    // 1. Clinic FAQ (JSON)
    const clinicFaq = await loadJson('clinic_faq.json');
    await processAndSeedDocuments('clinic_faq.json', clinicFaq);

    // 2. Intents (JSON)
    const intents = await loadJson('intents.json');
    await processAndSeedDocuments('intents.json', intents);

    // 3. Mental Health FAQ (CSV)
    const mentalHealth = await loadCsv('Mental_Health_FAQ.csv');
    await processAndSeedDocuments('Mental_Health_FAQ.csv', mentalHealth);

    // 4. Drugs (CSV) - LIMITED
    const drugs = await loadCsv('drugs_side_effects_drugs_com.csv', ROW_LIMIT);
    await processAndSeedDocuments('drugs_side_effects_drugs_com.csv', drugs);

    // 5. MedQuad (CSV) - LIMITED
    const medQuad = await loadCsv('medquad.csv', ROW_LIMIT);
    await processAndSeedDocuments('medquad.csv', medQuad);
}


// ==========================================
// MAIN
// ==========================================
async function main() {
  console.log('🌱 Starting RAG Database Seeding...');

  // --- EMBEDDING LOGIC ---
  // Resume logic is built-in (checks if document exists), but we keep the flag 
  // to avoid accidental API usage.
  if (process.env.SEED_EMBEDDINGS === 'true') { 
     console.log('🔮 Starting Vector Embedding Ingestion...');
     await ingestData();
     console.log('✨ Vector Embedding Ingestion Complete');
  } else {
     console.log('ℹ️  Skipping embeddings (set SEED_EMBEDDINGS=true to enable)');
  }
}

// To Run:
// export DATABASE_URL="postgresql://postgres:medbook_2026_db@127.0.0.1:5433/medbook_dev"; npx ts-node prisma/seed_rag.ts
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
