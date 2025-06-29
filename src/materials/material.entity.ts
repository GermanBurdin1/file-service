import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('materials')
export class MaterialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ['text', 'audio', 'video', 'pdf', 'image'],
    default: 'text'
  })
  type: 'text' | 'audio' | 'video' | 'pdf' | 'image';

  @Column('text')
  content: string;

  @Column({ nullable: true })
  description: string;

  @Column('uuid')
  createdBy: string;

  @Column()
  createdByName: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('text', { array: true, default: '{}' })
  attachedLessons: string[];

  @Column('text', { array: true, default: '{}' })
  tags: string[];
} 