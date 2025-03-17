import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';


@Injectable()
export class FileService {
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

	constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async uploadFile(file: Express.Multer.File, courseId: string): Promise<{ id: number; url: string; createdAt: Date }> {
		const fileKey = `uploads/${uuidv4()}-${file.originalname}`;
		const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
	
		await this.s3.send(new PutObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET_NAME,
			Key: fileKey,
			Body: file.buffer,
			ContentType: file.mimetype,
		}));
	
		// Сохраняем в PostgreSQL
		const newFile = this.fileRepository.create({
			filename: file.originalname,
			url: fileUrl,
			mimetype: file.mimetype,
			courseId: Number(courseId), // ✅ Приводим к числу
		});
	
		const savedFile = await this.fileRepository.save(newFile);
	
		return {
			id: savedFile.id,
			url: savedFile.url,
			createdAt: savedFile.createdAt,
		};
	}
	
	

	async getFilesByCourse(courseId: number): Promise<FileEntity[]> {
		return this.fileRepository.find({ where: { courseId } });
	}
	
}
