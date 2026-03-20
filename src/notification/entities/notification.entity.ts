import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  tenantId: string;

  @Column()
  userId!: string;

  @Column()
  type: string;

  @Column('text')
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;
}