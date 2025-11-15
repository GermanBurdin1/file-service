import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


@Entity()
export class FileEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	filename: string;

	@Column()
	url: string;

	@Column()
	mimetype: string;

	@Column({ nullable: true })
	courseId: number | null;

	@Column({ type: 'uuid' })
	userId: string;

	@Column({ nullable: true })
	tag: string | null;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;
}
