*This project has been created as part of the 42 curriculum by mnachit, asadiqui, alamaoui, del-ganb, sel-hadd.*

# MedBook - AI-Powered Medical Appointment & Management Platform

## Description

**MedBook** is a comprehensive full-stack web application designed to bridge the gap between doctors and patients. It simplifies the healthcare experience by offering seamless appointment booking, real-time consultation management, and AI-powered assistance.

The platform allows specific roles: **Patients** can find doctors, book appointments, and look up medical information via an AI assistant. **Doctors** can manage their availability, view their schedule, and handling patient requests. **Admins** oversee the entire platform ecosystem.

### Key Features
*   **Role-Based Access Control**: specialized dashboards for Admin, Doctor, and Patient.
*   **Advanced Appointment Booking**: complete flow from availability checking to booking confirmation.
*   **Real-Time Chat**: live communication between patients and doctors.
*   **AI Medical Assistant**: RAG-powered chatbot capable of answering medical context-aware queries.
*   **Notifications System**: instant alerts for booking status changes and messages.
*   **Secure Authentication**: includes Two-Factor Authentication (2FA) and Google OAuth.

---

## Instructions

### Prerequisites
*   **Docker & Docker Compose** (latest version)
*   **Node.js** (v20+ recommended for local development)
*   **NPM**

### Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd MedBook
    ```

2.  **Environment Configuration:**
    Create a `.env` file in the root directory. You can use the provided `.env.example` as a template.
    ```bash
    cp .env.example .env
    ```
    *Ensure you fill in necessary keys (Database URL, Google OAuth Client ID/Secret, JWT Secret, AI API Keys).*

3.  **Run with Docker (Recommended):**
    The entire application (Frontend, Backend, Database) can be launched with a single command.
    ```bash
    docker-compose up --build
    ```

4.  **Access the Application:**
    Access is only done through port 8443, as ports 3000 and 4000 are internal for Docker.
    *   **Main Application**: Open [https://localhost:8443](https://localhost:8443) in your browser.
    *   **Backend API**: Accessible via [https://localhost:8443/api](https://localhost:8443/api).

5.  **Stopping the Application:**
    ```bash
    docker-compose down
    ```

---

## Resources & AI Usage

### References
*   [NestJS Documentation](https://docs.nestjs.com/)
*   [Next.js Documentation](https://nextjs.org/docs)
*   [Prisma ORM](https://www.prisma.io/docs)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Socket.IO](https://socket.io/)

### AI Usage
Artificial Intelligence was utilized during development to enhance productivity and implement advanced features:
*   **Code Generation**: Used for generating boilerplate code for NestJS modules and repetitive UI components.
*   **Debugging**: Assisted in resolving complex type errors in TypeScript and Prisma schema relations.
*   **RAG Implementation**: AI tools helped structure the Retrieval-Augmented Generation logic, including proper vector embeddings strategy with `pgvector` and interfacing with the LLM providers.

---

## Team Information

| Member | Login | Role | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Mouad Nachit** | mnachit | Product Owner | Defined product vision for the booking system. Implemented the core **Booking & Availability** logic, ensuring doctors can manage schedules and patients can book slots without conflicts. |
| **Abdellah Sadiqui** | asadiqui | Project Manager | Managed project timeline and AI integration. Developed the **RAG & LLM** modules, integrating vector search for efficient document retrieval and AI responses. |
| **Abderrahmane Lamaoui** | alamaoui | Architect | Designed the system architecture. Implemented robust **User Management, Authentication (OAuth, 2FA)**, and security protocols. |
| **Douaae El Ganbour** | del-ganb | Developer | Focused on user engagement features. Developed the **Real-Time Chat** system using WebSockets, allowing seamless communication between users. |
| **Salah Eddine El Haddioui** | sel-hadd | Developer | Led the UI/UX implementation and **Notification** system. Designed the responsive frontend and integrated real-time system alerts. |

---

## Project Management

*   **Organization**: We adopted an Agile-like workflow, breaking down the project into sprints focused on specific modules (e.g., "Auth Sprint", "Booking Sprint").
*   **Tools**:
    *   **GitHub Projects**: For task tracking and backlog management.
    *   **Discord**: For daily stand-ups and real-time team communication.
    *   **Notion**: For documentation of API viewpoints and meeting notes.
*   **Workflow**: Feature branches were used for development (`feature/auth`, `feature/booking`), merging into `dev` after peer review, and finally to `main` for release.

---

## Technical Stack

*   **Frontend**:
    *   **Framework**: Next.js 14 (React) - Chosen for its server-side rendering capabilities and SEO friendliness.
    *   **Styling**: Tailwind CSS - For rapid and consistent UI development.
    *   **State Management**: Zustand - Lightweight and efficient state handling.

*   **Backend**:
    *   **Framework**: NestJS - Provides a structured, scalable architecture heavily inspired by Angular.
    *   **Language**: TypeScript - Ensures type safety across the entire stack.
    *   **Real-time**: Socket.IO - Used for chat and notifications.

*   **Database**:
    *   **PostgreSQL**: A robust relational database chosen for its reliability and support for `pgvector` (essential for RAG).
    *   **Prisma ORM**: Simplifies database interaction with type-safe queries.

*   **DevOps**:
    *   **Docker**: Containerization ensuring consistent environments across development and deployment.

---

## Database Schema

The database relies on PostgreSQL managed via Prisma. Below is a description of the key models and relationships:

*   **User**: The central entity. Contains authentication data (email, password, OAuth, 2FA), profile info, and a `Role` enum (PATIENT, DOCTOR, ADMIN). It has one-to-many relationships with *Bookings*, *Messages*, and *Notifications*.
*   **Availability**: Represents time slots created by Doctors. Linked to the *User* model (Doctor).
*   **Booking**: Represents a scheduled appointment. Links a **Patient** (User) and a **Doctor** (User), with status tracking (PENDING, ACCEPTED, CANCELLED).
*   **Message**: Stores chat history. Links `sender` and `receiver` (both Users).
*   **Notification**: Stores alerts for users. Linked to *User*, with types like `BOOKING_STATUS` or `CHAT_MESSAGE`.
*   **UserAiUsage**: Tracks token usage for AI features per user for rate limiting and analytics.

---

## Modules Implemented

**Total Points Claimed: 24/14**

### Web & User Experience
*   **[Minor] Use a backend framework (1pt)**: NestJS (Express based) used for robust API architecture.
*   **[Minor] Use a frontend framework (1pt)**: Next.js (React) used for the client application.
*   **[Major] Implement real-time features (2pts)**: WebSockets (Socket.IO) integration for instant communication.
*   **[Major] Allow users to interact with other users (2pts)**: Complete Chat system, User Profiles, and contact management.
*   **[Minor] Use an ORM (1pt)**: Prisma ORM for type-safe database interactions.
*   **[Minor] Notification system (1pt)**: Real-time alerts for bookings, messages, and system updates.
*   **[Minor] Custom-made design system (1pt)**: Consistent UI with reusable components, typography, and color palette.
*   **[Minor] File upload and management (1pt)**: Secure upload system for avatars and medical documents with validation.
*   **[Minor] Advanced search functionality (1pt)**: Search doctors by specialty/name with filters and pagination.

### User Management & Security
*   **[Major] Standard user management (2pts)**: Comprehensive profile management, avatar support, and user status.
*   **[Minor] Remote authentication (1pt)**: Google OAuth 2.0 integration for seamless login.
*   **[Major] Advanced permissions system (2pts)**: Role-based access control (Admin, Doctor, Patient) with specific CRUD rights.
*   **[Minor] 2FA system (1pt)**: TOTP-based Two-Factor Authentication for enhanced account security.

### Artificial Intelligence
*   **[Major] RAG system (2pts)**: Retrieval-Augmented Generation contextually answering queries using medical datasets.
*   **[Major] LLM system interface (2pts)**: Integration with Large Language Models for generating intelligent medical responses.

### Specialized Features
*   **[Major] Custom Module: Medical Appointment System (2pts)**: A complex booking engine handling time-slot conflicts, doctor availability logic, and booking state transitions. Justification: This is the core business logic of the application, requiring efficiently handling date/time logic and concurrency.
*   **[Minor] Custom Module: Doctor Dashboard (1pt)**: A specialized interfaces for doctors to manage their schedule and view patient analytics.

---

## Features List

1.  **Authentication & Security**:
    *   *Dev: Abderrahmane Lamaoui*
    *   Secure Email/Password auth, Google OAuth, 2FA enforcement, and JWT session handling. Implementation of RBAC (Role-Based Access Control) guards.

2.  **Medical Appointment System**:
    *   *Dev: Mouad Nachit*
    *   End-to-end booking flow: Doctor availability setting, Patient slot search, Booking request, Acceptance/Rejection logic. Includes complex validation for time overlaps.

3.  **Real-Time Communication**:
    *   *Dev: Douaae El Ganbour*
    *   Instant messaging infrastructure using Socket.IO, enabling private consultation chats between doctors and patients with online status tracking.

4.  **AI Consultant**:
    *   *Dev: Abdellah Sadiqui*
    *   RAG pipeline implementation using `pgvector` and LangChain/Groq. Processes user queries, retrieves relevant medical context, and generates safe responses.

5.  **UI/UX & Notifications**:
    *   *Dev: Salah Eddine El Haddioui*
    *   Responsive design system implementation. Global notification center handling system events (Booking updates, new messages) and toast alerts.

6.  **User & Document Management**:
    *   *Dev: Shared (Abderrahmane / Salah)*
    *   Profile editing, Avatar uploads, License document verification for doctors.

---

## Individual Contributions

*   **Mouad Nachit**: Architected the scheduling logic. Solved the complex problem of overlapping time slots and concurrency in bookings. Implemented the strict validation required for medical scheduling.
*   **Abdellah Sadiqui**: Handled the bleeding-edge AI tech stack. Configured the `pgvector` extension in Docker, wrote the embedding logic for documents, and tuned the LLM prompts for safety and accuracy.
*   **Abderrahmane Lamaoui**: Built the security backbone. Ensured that patient data is secure through robust Guard implementation in NestJS. Integrated Passport strategies for Google and JWT, and built the 2FA flow.
*   **Douaae El Ganbour**: Created the WebSocket gateway structure. Managed the state of active socket connections to ensure messages are delivered only to online users and stored for offline ones.
*   **Salah Eddine El Haddioui**: Crafted the visual identity. Built reusable React components (Buttons, Modals, Inputs) ensuring accessibility and responsiveness. Integrated the frontend toast system with backend events.
