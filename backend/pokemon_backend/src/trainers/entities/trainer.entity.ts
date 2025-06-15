import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Trainer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ type: 'date' }) // 👈 this tells TypeORM to store as MySQL DATE
  birthday: Date;

  @Column({ length: 15 })
  mobileNumber: string;

  @Column({ unique: true }) // Prevent duplicate emails
  email: string;

  @Column({ nullable: true })
  favoriteColor: string;
}

