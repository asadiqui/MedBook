import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('messages')
@Index(['sender_id', 'receiver_id'])
@Index(['appointment_id'])
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appointment_id: number;

  @Column()
  sender_id: number;

  @Column()
  receiver_id: number;

  @Column('text')
  content: string;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  timestamp: Date;
}
