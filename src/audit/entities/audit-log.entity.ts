import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  tenantId!: string;

  @Column()
  userId: string;

  @Column()
  action!: string;

  @Column('text')
  details: string;

  @CreateDateColumn()
  createdAt!: Date;
}