import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('users')
@Index(['email', 'tenantId'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Index()
  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}
