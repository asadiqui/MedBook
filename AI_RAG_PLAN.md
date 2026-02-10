# RAG System Implementation Plan (Ask Clinic)

This document outlines the step-by-step plan to implement the "Ask Clinic" RAG (Retrieval-Augmented Generation) module.

## 1. Architecture Overview

The system will ingest clinic documents from a local `/data` folder. When a user asks a question via the "Ask Clinic" chat, the system will retrieve relevant context and generate an answer using the existing LLM infrastructure.

### Components:
1.  **Vector Database**: `PostgreSQL` with `pgvector` extension.
2.  **Embedding Model**: Google Gemini (`gemini-embedding-001`) via direct API call.
3.  **LLM**: Existing `Groq` integration (Llama 3).
4.  **Ingestion Script**: A standalone script to read files from `/data`, generate embeddings, and seed the database.
5.  **Retrieval Logic**: Integrated into the `RagService` & `LlmService`.

---

## 2. Implementation Steps

### Phase 1: Infrastructure & Dependencies

1.  **Update Database Image**:
    -   Modify `docker-compose.yml` to use `pgvector/pgvector:pg16` (instead of standard `postgres`). This is critical for vector similarity search.
2.  **Install Backend Dependencies**:
    -   `csv-parse` (if CSVs are used, or just standard JSON parsing).
    -   No external RAG frameworks (LangChain) required. We will implement raw logic.

### Phase 2: Database Schema (Prisma)

1.  **Enable Vector Extension**:
    -   Create a migration to run `CREATE EXTENSION IF NOT EXISTS vector;`.
2.  **Create Models**:
    -   `Document`: Represents a source file (filename, path, type).
    -   `Embedding`: Stores the text chunk and its vector.
    -   *Note*: The `vector` field will be `Unsupported("vector(768)")` (Gemini embedding optimization is 768 dimensions).

### Phase 3: Ingestion Script (Seeding)

1.  **Prepare Data**:
    -   Ensure `/data` folder exists in root.
    -   Place generic JSON/Text files there containing clinic info (e.g., `["The clinic opens at 9am", "Dr. Smith specializes in Cardiology"]`).
2.  **Create Seed Script**:
    -   Create `backend/prisma/seed-rag.ts`.
    -   **Functionality**:
        1. Read files from `/root/medbook-main/data`.
        2. Split text into chunks (if long).
        3. Call Google Generative AI API (`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`) using `EMBEDDING_API_KEY`.
        4. Save chunk text + vector to the `Embedding` table.

### Phase 4: Retrieval & Generation Logic

1.  **Integration**:
    -   Update `LlmController` (current chat endpoint) to detect `agentId === 'rag'`.
    -   If `rag`, delegate to `RagService`.
2.  **`RagService` Logic**:
    -   **Embed Query**: Convert user's question to vector using the same Google API.
    -   **Vector Search**: Run a raw Prisma SQL query using the `<=>` (cosine distance) operator to find top 3-5 matches.
    -   **Prompt Construction**: "Context: {retrieved_text}. Question: {user_question}. Answer based on context."
    -   **Stream Response**: Use the existing `LlmService` stream capabilities to return the answer.

### Phase 5: Frontend Interface

1.  **Reuse Widget**:
    -   The `AiChatWidget` already supports an `agentId` prop.
    -   We do not need to build new components.
2.  **New Page**:
    -   Create `frontend/src/app/ask-clinic/page.tsx` (or similar).
    -   Render `<AiChatWidget mode="embedded" agentId="rag" />`.

---

## 3. Configuration

Ensure your `.env` in backend has:
```env
EMBEDDING_API_KEY=...
EMBEDDING_MODEL=gemini-embedding-001
# Database URL must point to the pgvector instance
```

## 4. Immediate Next Actions

1.  **Infrastructure**: Update `docker-compose.yml` to `pgvector/pgvector:pg16`.
2.  **Schema**: Update `schema.prisma` with `Document/Embedding` models.
3.  **Migration**: Run the migration to enable vector extension.
