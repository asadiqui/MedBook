import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Serve static files (avatars, uploads)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    // Database
    PrismaModule,
    // Features
    AuthModule,
    UsersModule,
    // Other modules will be added by teammates:
    // BookingsModule (Mouad)
    // AvailabilityModule (Mouad)
    // NotificationsModule (Salah)
    // ChatModule (Douae)
    // LlmModule (lmodir)
  ],
  controllers: [],
  providers: [
    // Apply JWT guard globally (use @Public() decorator for public routes)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}