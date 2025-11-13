import { Injectable } from '@nestjs/common';
// AWS S3 imports (закомментировано для локального хранения)
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';
// Локальное хранение файлов
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
	// AWS S3 клиент (закомментировано)
	// private s3 = new S3Client({
	//   region: process.env.AWS_REGION,
	//   credentials: {
	//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	//   },
	// });

	// Локальное хранение файлов
	private readonly uploadPath = path.join(process.cwd(), 'uploads');

	constructor(
		@InjectRepository(FileEntity)
		private readonly fileRepository: Repository<FileEntity>,
	) {
		// Создаем папку uploads если её нет (для локального хранения)
		if (!fs.existsSync(this.uploadPath)) {
			fs.mkdirSync(this.uploadPath, { recursive: true });
		}
	}

	async uploadFile(file: Express.Multer.File, userId: string,
		courseId: number | null): Promise<{ id: number; url: string; createdAt: Date }> {
		try {
			let fileUrl: string;

			// Выбор режима хранения через переменную окружения
			const storageMode = process.env.STORAGE_MODE || 'local'; // 'local' или 'aws'

			if (storageMode === 'aws') {
				// ==================== AWS S3 VERSION ====================
				console.log('☁️ Используется AWS S3 хранение');
				// Раскомментировать для использования AWS S3:
				// const fileKey = `uploads/${uuidv4()}-${file.originalname}`;
				// fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
				// 
				// await this.s3.send(new PutObjectCommand({
				//   Bucket: process.env.AWS_S3_BUCKET_NAME,
				//   Key: fileKey,
				//   Body: file.buffer,
				//   ContentType: file.mimetype,
				// }));

				// ВРЕМЕННАЯ ЗАГЛУШКА (удалить при переключении на AWS):
				throw new Error('AWS S3 режим не настроен. Раскомментируйте код выше и настройте AWS переменные.');

			} else {
				// ==================== LOCAL STORAGE VERSION (по умолчанию) ====================
				console.log('💾 Используется локальное хранение');
				// Генерируем уникальное имя файла
				const fileExtension = path.extname(file.originalname);
				const fileName = `${uuidv4()}${fileExtension}`;
				const filePath = path.join(this.uploadPath, fileName);

				// Сохраняем файл локально
				fs.writeFileSync(filePath, file.buffer);

				// URL для доступа к файлу через API Gateway
				const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://135.125.107.45:3011';
				fileUrl = `${apiGatewayUrl}/files/uploads/${fileName}`;

				console.log('💾 Файл сохранен локально:', filePath);
				console.log('🔗 URL файла:', fileUrl);
			}

			// ==================== COMMON CODE FOR BOTH VERSIONS ====================
			// Сохраняем в PostgreSQL
			const newFile = this.fileRepository.create({
				filename: file.originalname,
				url: fileUrl,
				mimetype: file.mimetype,
				userId: userId,
				courseId: courseId ?? null,
			});

			const savedFile = await this.fileRepository.save(newFile);


			return {
				id: savedFile.id,
				url: savedFile.url,
				createdAt: savedFile.createdAt,
			};
		} catch (error) {
			console.error('❌ Ошибка при загрузке файла:', error);
			throw new Error(`Ошибка при сохранении файла: ${error.message}`);
		}
	}

	async uploadFileAsCourse(file: Express.Multer.File, courseId: string, userId: string): Promise<{ id: number; url: string; createdAt: Date }> {
		try {
			let fileUrl: string;

			// Валидация и преобразование courseId
			let validCourseId: number;
			if (!courseId || courseId.trim() === '') {
				validCourseId = 1; // ID по умолчанию для общих материалов
				console.log('⚠️ courseId пустой, используется ID по умолчанию: 1');
			} else if (isNaN(Number(courseId))) {
				// Если courseId не является числом (например, 'materials'), используем ID по умолчанию
				validCourseId = 1;
				console.log(`⚠️ courseId "${courseId}" не является числом, используется ID по умолчанию: 1`);
			} else {
				validCourseId = Number(courseId);
				console.log(`✅ Используется courseId: ${validCourseId}`);
			}

			// Выбор режима хранения через переменную окружения
			const storageMode = process.env.STORAGE_MODE || 'local'; // 'local' или 'aws'

			if (storageMode === 'aws') {
				// ==================== AWS S3 VERSION ====================
				console.log('☁️ Используется AWS S3 хранение');
				// Раскомментировать для использования AWS S3:
				// const fileKey = `uploads/${uuidv4()}-${file.originalname}`;
				// fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
				// 
				// await this.s3.send(new PutObjectCommand({
				//   Bucket: process.env.AWS_S3_BUCKET_NAME,
				//   Key: fileKey,
				//   Body: file.buffer,
				//   ContentType: file.mimetype,
				// }));

				// ВРЕМЕННАЯ ЗАГЛУШКА (удалить при переключении на AWS):
				throw new Error('AWS S3 режим не настроен. Раскомментируйте код выше и настройте AWS переменные.');

			} else {
				// ==================== LOCAL STORAGE VERSION (по умолчанию) ====================
				console.log('💾 Используется локальное хранение');
				// Генерируем уникальное имя файла
				const fileExtension = path.extname(file.originalname);
				const fileName = `${uuidv4()}${fileExtension}`;
				const filePath = path.join(this.uploadPath, fileName);

				// Сохраняем файл локально
				fs.writeFileSync(filePath, file.buffer);

				// URL для доступа к файлу через API Gateway
				const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://135.125.107.45:3011';
				fileUrl = `${apiGatewayUrl}/files/uploads/${fileName}`;

				console.log('💾 Файл сохранен локально:', filePath);
				console.log('🔗 URL файла:', fileUrl);
			}

			// ==================== COMMON CODE FOR BOTH VERSIONS ====================
			// Сохраняем в PostgreSQL
			const newFile = this.fileRepository.create({
				filename: file.originalname,
				url: fileUrl,
				mimetype: file.mimetype,
				courseId: validCourseId, // Используем валидированный courseId
				userId: userId, // Добавляем владельца файла
			});

			const savedFile = await this.fileRepository.save(newFile);

			console.log('✅ Файл успешно сохранен в БД с courseId:', validCourseId);

			return {
				id: savedFile.id,
				url: savedFile.url,
				createdAt: savedFile.createdAt,
			};
		} catch (error) {
			console.error('❌ Ошибка при загрузке файла:', error);
			throw new Error(`Ошибка при сохранении файла: ${error.message}`);
		}
	}

	async getFilesByCourse(courseId: number, userId: string): Promise<FileEntity[]> {
		return this.fileRepository.find({
			where: {
				courseId,
				userId // Пользователь может видеть только свои файлы
			}
		});
	}

	// Дополнительный метод для удаления файлов (только для локального хранения)
	async deleteFile(fileId: number, userId: string): Promise<boolean> {
		try {
			const file = await this.fileRepository.findOne({ where: { id: fileId } });
			if (!file) {
				return false;
			}

			// Проверяем, что пользователь является владельцем файла
			if (file.userId !== userId) {
				throw new Error('Unauthorized: You can only delete your own files');
			}

			// ==================== LOCAL STORAGE DELETE ====================
			// Извлекаем имя файла из URL
			const fileName = path.basename(file.url);
			const filePath = path.join(this.uploadPath, fileName);

			// Удаляем физический файл
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}

			// ==================== AWS S3 DELETE (закомментировано) ====================
			// const fileKey = file.url.split('.amazonaws.com/')[1];
			// await this.s3.send(new DeleteObjectCommand({
			//   Bucket: process.env.AWS_S3_BUCKET_NAME,
			//   Key: fileKey,
			// }));

			// Удаляем запись из БД
			await this.fileRepository.delete(fileId);

			console.log('🗑️ Файл удален:', filePath);
			return true;
		} catch (error) {
			console.error('❌ Ошибка при удалении файла:', error);
			return false;
		}
	}
}
