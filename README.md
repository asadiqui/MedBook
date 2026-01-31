# ft_transcendence — Doctor Booking System

This project implements a doctor appointment booking system as part of **ft_transcendence (42)**.

The focus of my contribution is the **Booking & Availability system**, including scheduling, conflict prevention, and role-based access.

---

## 🛠 Tech Stack

- **Backend**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT
- **Frontend**: Next.js
- **Containerization**: Docker & Docker Compose

---

## 🚀 How to Run

```bash
docker compose up --build


Backend runs on:

http://localhost:3001


Swagger API docs:

http://localhost:3001/api/docs

🔐 Authentication

JWT-based authentication

Two roles:

PATIENT: can create and cancel bookings

DOCTOR: can manage availability and accept/reject bookings

Auth is handled by a shared user module (merged with team)

📅 Availability

Doctors define available time slots.

Endpoints

POST /availability

GET /availability?doctorId=&date=

DELETE /availability/:id

GET /availability/calendar?doctorId=&from=&to=

Rules

Working hours: 08:00 → 20:00

No overlapping availability

Valid time format enforced

📌 Booking

Patients request appointments inside doctor availability.

Endpoints

POST /booking

PATCH /booking/:id/accept

PATCH /booking/:id/reject

PATCH /booking/:id/cancel

GET /booking/patient

GET /booking/doctor

GET /booking/doctor/:id?date=

Rules

Only patients can create bookings

Booking duration: 60 or 120 minutes

Bookings must fit inside availability

No overlapping bookings per doctor

Status flow:

PENDING → ACCEPTED | REJECTED

PENDING / ACCEPTED → CANCELLED

🧪 Demo Flow (Evaluation)

Login as Doctor

Create availability

Login as Patient

Create booking (PENDING)

Doctor accepts booking

Patient sees ACCEPTED status

Doctor views daily schedule