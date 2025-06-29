import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('homework')
export class HomeworkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('uuid')
  assignedBy: string;

  @Column()
  assignedByName: string;

  @Column('uuid')
  assignedTo: string;

  @Column()
  assignedToName: string;

  @Column('uuid', { nullable: true })
  lessonId: string;

  @Column({ type: 'timestamp', nullable: true })
  lessonDate: Date;

  @CreateDateColumn()
  assignedAt: Date;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: ['assigned', 'submitted', 'completed', 'overdue'],
    default: 'assigned'
  })
  status: 'assigned' | 'submitted' | 'completed' | 'overdue';

  @Column('text', { array: true, default: '{}' })
  materialIds: string[];

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  teacherFeedback: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  grade: number;

  @Column({ default: false })
  isLinkedToMaterials: boolean;
} 