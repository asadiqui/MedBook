import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async saveMessage(
    appointmentId: number,
    senderId: number,
    receiverId: number,
    content: string,
  ) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });
    const receiver = await this.usersRepository.findOne({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      throw new BadRequestException('User not found');
    }

    const message = this.messagesRepository.create({
      appointment_id: appointmentId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
    });

    const savedMessage = await this.messagesRepository.save(message);

    return {
      ...savedMessage,
      sender,
      receiver,
      appointment,
    };
  }

  async getAppointmentMessages(appointmentId: number) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const messages = await this.messagesRepository.find({
      where: { appointment_id: appointmentId },
      order: { timestamp: 'ASC' },
    });

    const messagesWithUsers = await Promise.all(
      messages.map(async (msg) => ({
        ...msg,
        sender: await this.usersRepository.findOne({
          where: { id: msg.sender_id },
        }),
        receiver: await this.usersRepository.findOne({
          where: { id: msg.receiver_id },
        }),
      })),
    );

    return {
      appointment,
      messages: messagesWithUsers,
    };
  }

  async getConversation(userId1: number, userId2: number) {
    const messages = await this.messagesRepository
      .createQueryBuilder('message')
      .where(
        '(message.sender_id = :userId1 AND message.receiver_id = :userId2) OR (message.sender_id = :userId2 AND message.receiver_id = :userId1)',
        { userId1, userId2 },
      )
      .orderBy('message.timestamp', 'ASC')
      .getMany();

    return messages;
  }

  async markAsRead(messageId: number) {
    await this.messagesRepository.update(messageId, { is_read: true });
    return this.messagesRepository.findOne({ where: { id: messageId } });
  }
}
