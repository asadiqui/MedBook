import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export const RATE_LIMIT_ERROR_MESSAGE = 'System Busy, please try again in 5 seconds';
export const DAILY_LIMIT_ERROR_MESSAGE = 'You have reached your limit. You can try again after a while or tomorrow.';

@Injectable()
export class RagService {
  private groq: Groq;
  private genAI: GoogleGenerativeAI;
  private modelName = 'llama-3.1-8b-instant'; 
  private embeddingModel = 'gemini-embedding-001'; 
  private readonly DAILY_TOKEN_LIMIT = 100000;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const ragApiKey = this.configService.get<string>('RAG_API_KEY');
    const embeddingApiKey = this.configService.get<string>('EMBEDDING_API_KEY');
    
    // Load models from env if available
    this.modelName = this.configService.get<string>('RAG_MODEL') || this.modelName; 
    this.embeddingModel = this.configService.get<string>('EMBEDDING_MODEL') || this.embeddingModel; 

    if (!ragApiKey) console.warn('RAG_API_KEY is not set');
    if (!embeddingApiKey) console.warn('EMBEDDING_API_KEY is not set');

    this.groq = new Groq({ apiKey: ragApiKey || 'dummy' });
    this.genAI = new GoogleGenerativeAI(embeddingApiKey || 'dummy');
  }

  private getDateKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  private async checkDailyLimit(userId: string) {
    const date = this.getDateKey();
    const usage = await this.prisma.userAiUsage.findUnique({
      where: { userId_date: { userId, date } },
    });

    if (usage && usage.ragTokenCount >= this.DAILY_TOKEN_LIMIT) {
      throw new Error(DAILY_LIMIT_ERROR_MESSAGE);
    }
  }

  private async trackUsage(userId: string, tokens: number) {
    if (!tokens || tokens <= 0) return;
    const date = this.getDateKey();
    await this.prisma.userAiUsage.upsert({
      where: { userId_date: { userId, date } },
      update: { ragTokenCount: { increment: tokens } },
      create: { userId, date, ragTokenCount: tokens },
    });
  }

  async query(userId: string, question: string, history: any[] = []): Promise<string> {
    try {
        await this.checkDailyLimit(userId);

        // 1. Vectorize Question
        const embeddingModel = this.genAI.getGenerativeModel({ model: this.embeddingModel });
        const result = await embeddingModel.embedContent(question);
        const vector = result.embedding.values;
        const vectorString = `[${vector.join(',')}]`;

        // 2. Search Vector DB
        // Use Prisma raw query to find similar documents
        // cast parameter to vector type for pgvector
        const similarDocs: any[] = await this.prisma.$queryRaw`
            SELECT content, source, 1 - (embedding <=> ${vectorString}::vector) as similarity
            FROM "documents"
            WHERE 1 - (embedding <=> ${vectorString}::vector) > 0.3
            ORDER BY embedding <=> ${vectorString}::vector ASC
            LIMIT 5;
        `;

        const contextText = similarDocs.length > 0 
          ? similarDocs.map(doc => `Source: ${doc.source}\nContent: ${doc.content}`).join('\n\n')
          : "No specific medical documents found in database.";

        // 3. Construct Prompt
        const systemInstruction = `
            You are a helpful and professional medical assistant for "Ask Clinic".
            Your goal is to answer patient questions using the provided Context.
            
            Instructions:
            1. Use the Context below to answer the user's question.
            2. If the Context contains the answer, provide it clearly.
            3. If the Context does NOT contain relevant information, politely state that you don't have that information in your database and recommend consulting a doctor.
            4. Do NOT hallucinate or invent medical advice.
            5. Keep your tone empathetic and professional.

            Context:
            ${contextText}
        `;

        // 4. Prepare Messages (History + System + User)
        const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [];
        messages.push({ role: 'system', content: systemInstruction });

        // Retrieve conversation history from DB
        const previousHistory = await this.prisma.aiMessage.findMany({
            where: { userId, agentId: 'rag' },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        const historyMessages = previousHistory.reverse().map(h => ({
             role: (h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
             content: h.content,
        }));
        messages.push(...historyMessages);
        messages.push({ role: 'user', content: question });

        // Save User Message
        await this.prisma.aiMessage.create({
            data: { userId, agentId: 'rag', role: 'user', content: question },
        });

        // 5. Call Groq LLM
        const completion = await this.groq.chat.completions.create({
            messages,
            model: this.modelName,
            temperature: 0.3,
        });

        const responseText = completion.choices[0]?.message?.content || '';
        const tokens = completion.usage?.total_tokens || 0;
        
        await this.trackUsage(userId, tokens);

        // Save Assistant Response
        if (responseText) {
            await this.prisma.aiMessage.create({
                data: { userId, agentId: 'rag', role: 'assistant', content: responseText },
            });
        }

        return responseText;

    } catch (error) {
        console.error('Error in RAG query:', error);
        // Clean error message for user
        const msg = error instanceof Error ? error.message : String(error);
        if (msg === DAILY_LIMIT_ERROR_MESSAGE || msg === RATE_LIMIT_ERROR_MESSAGE) {
            throw error;
        }
        throw new Error(`Failed to process RAG request: ${msg}`);
    }
  }
}
