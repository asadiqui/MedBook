import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patient_id: number;

  @Column()
  doctor_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column()
  datetime: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'cancelled';

  @Column('text', { nullable: true })
  symptom_summary: string;
}
