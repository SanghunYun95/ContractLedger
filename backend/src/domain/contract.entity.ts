import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  originalFileName: string;

  @Column({ default: 'DRAFT' })
  status: string; // DRAFT, PENDING, SIGNED, EXPIRED

  @Column({ type: 'int', nullable: true })
  riskScore: number;

  @Column({ type: 'text', nullable: true })
  riskAnalysis: string;

  @Index()
  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
