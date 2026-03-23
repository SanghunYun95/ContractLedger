import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index(['tenantId', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  resourceId: string | null;

  @Column({ type: 'json', nullable: true })
  details: Record<string, unknown> | null;

  @Column({ nullable: true })
  ipAddress: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
