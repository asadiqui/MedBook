import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  specialty: string;

  @Column('text')
  biography: string;

  @Column({ default: 'pending' })
  verification_status: string;
}
