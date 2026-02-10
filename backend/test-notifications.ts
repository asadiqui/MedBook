import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Create a test user
    console.log('Creating a test user...');
    const user = await prisma.user.create({
      data: {
        email: `test-notif-${Date.now()}@test.com`,
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        role: 'PATIENT',
      },
    });
    console.log('✓ User created:', user.id);

    // 2. Create a notification
    console.log('\nCreating a notification...');
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: NotificationType.BOOKING_STATUS,
        title: 'Booking Confirmed',
        body: 'Your appointment has been confirmed',
        data: {
          bookingId: 'booking-123',
          doctorName: 'Dr. Smith',
        },
      },
    });
    console.log('✓ Notification created:', notification);

    // 3. Fetch unread notifications
    console.log('\nFetching unread notifications...');
    const unreadNotifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('✓ Unread notifications:', unreadNotifications);

    // 4. Mark notification as read
    console.log('\nMarking notification as read...');
    const updatedNotification = await prisma.notification.update({
      where: { id: notification.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    console.log('✓ Updated notification:', updatedNotification);

    // 5. Delete test user and cascade delete notifications
    console.log('\nCleaning up test data...');
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log('✓ Test data cleaned up');

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
