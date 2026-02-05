# MedBook - AI-Powered Medical Appointment Platform

MedBook is a comprehensive medical appointment booking and management platform designed to connect patients with doctors. It leverages advanced AI capabilities to enhance the healthcare experience, featuring real-time communication, smart scheduling, and intelligent health assistance.

## 🚀 Features

### 👤 User Management & Profiles
*   **Role-Based Access:** Secure authentication for **Patients**, **Doctors**, and **Admins**.
*   **Detailed Profiles:** Doctors can manage their specialization, experience, and pricing. Patients can manage their medical history.
*   **Document Uploads:** Secure storage for medical reports and prescriptions using Multer.

### 📅 Appointment & Availability
*   **Smart Scheduling:** Doctors can set granular availability slots.
*   **Easy Booking:** Patients can browse doctors and book appointments seamlessly.
*   **Calendar Integration:** (Planned) Sync with external calendars.

### 💬 Real-Time Communication
*   **Instant Chat:** Secure, real-time messaging between doctors and patients using **Socket.io**.
*   **File Sharing:** Share reports and images directly within the chat.

### 🤖 AI-Powered Health Assistance
*   **LLM Integration:** Built-in AI assistant powered by **Google Gemini** to answer health-related queries.
*   **RAG (Retrieval-Augmented Generation):** Provides context-aware answers based on verified medical data and user history.
*   **Sentiment Analysis:** Analyzes patient feedback and chat tone to prioritize urgent cases.
*   **Content Moderation:** Automatically filters inappropriate content in chats and reviews.
*   **Recommendations:** personalized doctor recommendations based on patient needs.

### 🔔 Notifications
*   **Real-time Alerts:** Instant notifications for appointment confirmations, reminders, and new messages.
*   **Email Notifications:** Automated emails for booking receipts and password resets (via Nodemailer).

---

## 🛠️ Tech Stack

### Backend
*   **Framework:** [NestJS](https://nestjs.com/)
*   **Language:** TypeScript
*   **Database:** PostgreSQL (with [Prisma ORM](https://www.prisma.io/))
*   **Real-time:** Socket.io
*   **AI:** Google Generative AI SDK, LangChain (implied)
*   **Authentication:** Passport.js (JWT, Google OAuth)
*   **Containerization:** Docker

### Frontend
*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand
*   **Forms:** React Hook Form + Zod
*   **UI Components:** Lucide React

---

## 🏃‍♂️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   Docker & Docker Compose
*   PostgreSQL (if running locally without Docker)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/medbook.git
    cd medbook
    ```

2.  **Environment Setup**
    Create a `.env` file in the `backend` directory based on the example below:

    ```env
    # Database
    DATABASE_URL="postgresql://postgres:password@localhost:5432/medbook?schema=public"

    # JWT
    JWT_SECRET="your-super-secret-key"

    # Google AI
    GEMINI_API_KEY="your-gemini-api-key"

    # Email
    SMTP_HOST="smtp.example.com"
    SMTP_USER="user@example.com"
    SMTP_PASS="password"
    ```

3.  **Run with Docker (Recommended)**
    This will start the Backend, Frontend, and Database.

    ```bash
    docker-compose up --build
    ```

4.  **Local Development (Manual)**

    *   **Backend:**
        ```bash
        cd backend
        npm install
        npx prisma migrate dev
        npm run start:dev
        ```

    *   **Frontend:**
        ```bash
        cd frontend
        npm install
        npm run dev
        ```

Access the application at:
*   Frontend: `http://localhost:3000`
*   Backend API: `http://localhost:3001` (or configured port)
*   Prisma Studio: `npx prisma studio` (inside backend folder)

---

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
