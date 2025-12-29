import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { User } from './users/entities/user.entity';
import { Appointment } from './appointments/entities/appointment.entity';
import { Message } from './chat/entities/message.entity';
import { Doctor } from './doctors/entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'myuser',
      password: 'mypassword',
      database: 'medbook_db',
      entities: [User, Appointment, Message, Doctor],
      synchronize: true,
    }),

    ChatModule,
  ],
})
export class AppModule {}
