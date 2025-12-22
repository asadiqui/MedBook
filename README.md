# Tech Stack
- Core: React (next.js), Node.js (NestJs), PostgreSQL (Prisma)
- AI Specific:

Module | Implementaion | Tech/Library | Why? | Estimated Time Units (D)
----|----|----|----|----
RAG (Ask Clinic) | An "Ask the Clinic" chatbot. It retrieves data from medical guidelines, clinic FAQs and specific data to answer patient questions (e.g., "Do I need to fast before a blood test?", "What are the opening hours?", "Do you treat flu?"). | LangChain.js + Gemini API + pgvector with Prisma ORM | LangChain is the #1 framework for chaining LLM logic. PGVector Runs inside your existing Postgres container. | 7–14
LLM (Symptom Checker) | A "Symptom Checker" where patients describe how they feel, and the AI generates a brief summary for the doctor to read before the appointment. | Gemini API (Flash 2.5/1.5) | Generous free tier (15 requests/min), fast, and smart enough for chatbots. You can swap for generic HuggingFace models later if needed. | 3–5
Recommendation (Suggested Doctors) | A "Suggested Doctors" feature that recommends specialists based on the patient's search history, reported symptoms, and previous booking behavior. | Python (Scikit-Learn) or Postgres | For simple logic standard SQL queries or Python's Scikit-Learn (Cosine Similarity) are standard. No need for deep learning yet. | 5–10
Content Moderation | An automatic filter that blocks abusive language or spam in doctor reviews and patient messages. | Google Gemini API | OpenAI provides a free/cheap endpoint specifically for this. It's faster and better than building your own classifier. | 1–2
Sentiment Analysis | Analyze patient reviews to display a "Satisfaction Score" for each doctor to show if overall satisfaction is positive, neutral, or negative. | Google Gemini API | Gemini is actually smarter than the Python libraries (TextBlob) because it understands slang and sarcasm. | 1–2
Image Recognition | Enable scanning of identity cards to auto-fill forms, or upload photos of skin conditions for preliminary dermatologist triage. Analyse medical documents. | Tesseract.js (OCR) | The standard JavaScript library for reading text from images directly in the browser or Node.js. | 3–5
Voice Integration | Add a "Voice Search" button allowing patients to find doctors or book slots by speaking instead of typing. And a voice-to-text for doctors to dictate patient notes. | Web Speech API (Browser Native) | It's built into Chrome/Edge/Safari. No external libraries needed for basic speech-to-text. | 2–3

# Suggested Folder Structure
```
medbook/
├── docker-compose.yml
├── .env
├── README.md
├── ai_data/                      # lmodir (Storage for RAG documents/PDFs)
│
├── backend/                      # NestJS Backend
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   └── src/
│       ├── auth/                 # Abderrahmane
│       ├── users/                # Abderrahmane
│       ├── bookings/             # Mouad
│       ├── availability/         # Mouad
│       ├── notifications/        # Salah
│       ├── chat/                 # Douae
│       ├── ai/                   # lmodir (Main AI Module)
│       │   ├── rag/              # lmodir (Ask the Clinic logic)
│       │   ├── llm/              # lmodir (Symptom Checker logic)
│       │   ├── recommendations/  # lmodir (Doctor matching logic)
│       │   ├── moderation/       # lmodir (Content filter service)
│       │   ├── sentiment/        # lmodir (Review analysis)
│       │   └── vision/           # lmodir (Image recognition/OCR)
│       
│
└── frontend/                     # Next.js Frontend
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── app/
        │   ├── login/            # Abderrahmane
        │   ├── register/         # Abderrahmane
        │   ├── profile/          # Abderrahmane
        │   ├── doctors/          # Mouad
        │   ├── dashboard/        # Mouad
        │   ├── chat/             # Douae
        │   
        ├── components/
        │   ├── auth/             # Abderrahmane
        │   ├── profile/          # Abderrahmane
        │   ├── doctors/          # Mouad
        │   ├── dashboard/        # Mouad
        │   ├── notifications/    # Salah
        │   ├── chat/             # Douae
        │   ├── ai/               # lmodir (AI UI Components)
        │   │   ├── AskClinic.tsx      # lmodir (RAG Chatbot UI)
        │   │   ├── SymptomChecker.tsx # lmodir (LLM Interface UI)
        │   │   ├── VoiceInput.tsx     # lmodir (Voice Search Button)
        │   │   └── IDScanner.tsx      # lmodir (Image Upload/Scan UI)
        │   └── shared/
        ├── lib/
        └── hooks/
            └── useSpeech.ts      # lmodir (Voice-to-Text Logic)
```