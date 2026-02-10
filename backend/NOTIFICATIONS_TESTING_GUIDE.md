# Notification Model Testing Guide

## Overview
I've set up a complete Notification feature with:
- **Database Model** (`Notification` in prisma/schema.prisma)
- **Migration** (20260209000000_add_notifications)
- **NestJS Service** (NotificationsService with full CRUD operations)
- **REST API** (NotificationsController with endpoints)
- **Unit Tests** (NotificationsService.spec.ts)

## How to Test

### Option 1: Run Migrations & Start the App (Recommended)

```bash
# In the backend directory
cd /home/salah01/loop/backend

# Apply migrations to your database
docker-compose up -d postgres  # Make sure your database is running

# Run migrations
npm run migrate:dev

# Start the application
npm run start:dev
```

### Option 2: Test Using HTTP Requests (After App is Running)

Once your app is running on `http://localhost:3001`, test these endpoints:

#### 1. Create a Notification
```bash
curl -X POST http://localhost:3001/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user-id-here",
    "type": "BOOKING_STATUS",
    "title": "Appointment Confirmed",
    "body": "Your appointment has been confirmed",
    "data": {
      "bookingId": "123",
      "doctorName": "Dr. Smith"
    }
  }'
```

#### 2. Get All Notifications
```bash
curl http://localhost:3001/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Get Unread Notifications Only
```bash
curl http://localhost:3001/notifications/unread \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Get Unread Count
```bash
curl http://localhost:3001/notifications/unread/count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. Mark as Read
```bash
curl -X POST http://localhost:3001/notifications/{notificationId}/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 6. Delete a Notification
```bash
curl -X DELETE http://localhost:3001/notifications/{notificationId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Option 3: Run Unit Tests

```bash
cd /home/salah01/loop/backend

# Install dependencies if needed
npm install

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### Option 4: Use Database Client (Direct Query)

Using Prisma Studio to query the database:
```bash
cd /home/salah01/loop/backend
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can:
- Create, read, update, delete notifications
- View all records
- Test relationships

## Notification Types

The system supports three notification types:
- `BOOKING_STATUS` - For appointment/booking updates
- `CHAT_MESSAGE` - For new messages
- `SYSTEM` - For system-wide notifications

## Usage Example in Your Code

```typescript
import { NotificationsService } from './notifications/notifications.service';
import { NotificationType } from '@prisma/client';

// In any service/controller
constructor(private notificationsService: NotificationsService) {}

// Send notification to a user
await this.notificationsService.create({
  userId: userId,
  type: NotificationType.BOOKING_STATUS,
  title: 'Booking Confirmed',
  body: 'Your appointment with Dr. Smith is confirmed',
  data: {
    bookingId: booking.id,
    doctorId: booking.doctorId,
  }
});

// Get unread notifications
const unread = await this.notificationsService.getUnreadByUserId(userId);

// Mark as read
await this.notificationsService.markAsRead(notificationId);
```

## Files Created

- `/src/notifications/notifications.module.ts` - Module definition
- `/src/notifications/notifications.service.ts` - Service with business logic
- `/src/notifications/notifications.controller.ts` - REST API endpoints
- `/src/notifications/notifications.service.spec.ts` - Unit tests
- `/prisma/migrations/20260209000000_add_notifications/migration.sql` - Database migration
- `test-notifications.ts` - Standalone test script

## Troubleshooting

### Migration Fails
If the migration command fails, make sure:
1. Your database is running: `docker-compose up -d postgres`
2. `DATABASE_URL` is set correctly in `.env`
3. PostgreSQL server is accessible

### JWT Authorization Errors
Make sure you have a valid JWT token from logging in first. Attach it as:
```
Authorization: Bearer <your_jwt_token>
```

### Prisma Type Issues
If TypeScript complains about types:
```bash
npm run prisma generate
```

## Next Steps

1. Apply the migration to your database
2. Start your application
3. Test using one of the methods above
4. Integrate notifications into your booking and chat modules
5. Add notification listeners (WebSocket for real-time updates)

