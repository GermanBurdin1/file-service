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
				const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3011';
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

	async uploadFileAsCourse(file: Express.Multer.File, courseId: string, userId: string, tag?: string | null): Promise<{ id: number; url: string; createdAt: Date }> {
		try {
			let fileUrl: string;

			// Валидация и преобразование courseId
			let validCourseId: number;
			
			// Обрабатываем случай, когда courseId может быть строкой с запятыми (например, "3,3")
			let courseIdStr = typeof courseId === 'string' ? courseId : String(courseId);
			
			// Убираем дублирование, если есть запятые
			if (courseIdStr.includes(',')) {
				courseIdStr = courseIdStr.split(',')[0].trim();
				console.log(`⚠️ Обнаружено дублирование courseId, используется первое значение: ${courseIdStr}`);
			}
			
			if (!courseIdStr || courseIdStr.trim() === '') {
				validCourseId = 1; // ID по умолчанию для общих материалов
				console.log('⚠️ courseId пустой, используется ID по умолчанию: 1');
			} else if (isNaN(Number(courseIdStr))) {
				// Если courseId не является числом (например, 'materials'), используем ID по умолчанию
				validCourseId = 1;
				console.log(`⚠️ courseId "${courseIdStr}" не является числом, используется ID по умолчанию: 1`);
			} else {
				validCourseId = Number(courseIdStr);
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
				const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3011';
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
				tag: tag || null, // Сохраняем раздел (tag)
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
		console.log(`🔍 Поиск файлов для курса ${courseId}, пользователь ${userId}`);
		
		// Сначала ищем файлы пользователя, связанные с курсом
		let files = await this.fileRepository.find({
			where: {
				courseId,
				userId // Пользователь может видеть только свои файлы
			}
		});
		
		console.log(`✅ Найдено файлов пользователя ${userId}: ${files.length}`);
		
		// Если не нашли файлы пользователя, проверяем, есть ли вообще файлы с таким courseId
		// (возможно, файлы были созданы с системным userId)
		if (files.length === 0) {
			const allFilesWithCourseId = await this.fileRepository.find({
				where: { courseId }
			});
			console.log(`   Всего файлов с courseId ${courseId}: ${allFilesWithCourseId.length}`);
			if (allFilesWithCourseId.length > 0) {
				allFilesWithCourseId.forEach(f => console.log(`     - Файл ${f.id}: ${f.filename} (userId: ${f.userId}, ожидался: ${userId})`));
				
				// Если есть файлы с courseId, но с другим userId, возвращаем их тоже
				// Это позволяет видеть файлы, которые были связаны с курсом, даже если они созданы с системным userId
				files = allFilesWithCourseId;
				console.log(`⚠️ Возвращаем все файлы курса ${courseId} (включая файлы с другим userId)`);
			}
		}
		
		if (files.length > 0) {
			files.forEach(f => console.log(`   - Файл ${f.id}: ${f.filename} (courseId: ${f.courseId}, userId: ${f.userId})`));
		}
		
		return files;
	}

	// Удаление связи файла с курсом (файл остается в системе)
	async removeFileFromCourse(fileId: number, courseId: number, userId: string): Promise<boolean> {
		try {
			const file = await this.fileRepository.findOne({ where: { id: fileId } });
			if (!file) {
				return false;
			}

			// Проверяем, что пользователь является владельцем файла
			if (file.userId !== userId) {
				throw new Error('Unauthorized: You can only remove your own files from courses');
			}

			// Проверяем, что файл действительно связан с этим курсом
			if (file.courseId !== courseId) {
				throw new Error('File is not associated with this course');
			}

			// Удаляем связь с курсом (устанавливаем courseId в null)
			file.courseId = null;
			await this.fileRepository.save(file);

			console.log(`🔗 Связь файла ${fileId} с курсом ${courseId} удалена. Файл сохранен.`);
			return true;
		} catch (error) {
			console.error('❌ Ошибка при удалении связи файла с курсом:', error);
			throw error;
		}
	}

	// Связывание существующего файла с курсом по URL
	async linkFileToCourseByUrl(fileUrl: string, courseId: number, userId: string, tag?: string | null): Promise<{ id: number; url: string; createdAt: Date }> {
		try {
			// Извлекаем имя файла из URL (например, из /uploads/xxx.mp3 или http://.../files/uploads/xxx.mp3)
			let fileName = '';
			if (fileUrl.includes('/uploads/')) {
				const uploadsIndex = fileUrl.indexOf('/uploads/');
				const pathAfterUploads = fileUrl.substring(uploadsIndex + '/uploads/'.length);
				// Убираем query параметры если есть
				fileName = pathAfterUploads.split('?')[0].split('#')[0];
			} else {
				// Если нет /uploads/, пытаемся извлечь имя файла из конца URL
				fileName = path.basename(fileUrl).split('?')[0].split('#')[0];
			}

			console.log(`🔍 Поиск файла по имени: "${fileName}" для пользователя ${userId}`);

			// Ищем файл по имени файла в URL (используем LIKE для поиска по части URL)
			// Сначала пробуем точное совпадение по полному URL
			let file = await this.fileRepository.findOne({ 
				where: { 
					url: fileUrl,
					userId
				} 
			});

			// Если не нашли по точному совпадению, ищем по имени файла в URL
			if (!file && fileName) {
				const files = await this.fileRepository.find({
					where: { userId }
				});

				// Ищем файл, у которого URL содержит имя файла
				file = files.find(f => {
					const fileUrlInDb = f.url;
					// Извлекаем имя файла из URL в БД
					let dbFileName = '';
					if (fileUrlInDb.includes('/uploads/')) {
						const dbUploadsIndex = fileUrlInDb.indexOf('/uploads/');
						const dbPathAfterUploads = fileUrlInDb.substring(dbUploadsIndex + '/uploads/'.length);
						dbFileName = dbPathAfterUploads.split('?')[0].split('#')[0];
					} else {
						dbFileName = path.basename(fileUrlInDb).split('?')[0].split('#')[0];
					}
					return dbFileName === fileName;
				});
			}

			if (!file) {
				console.error(`❌ Файл не найден. Искали по URL: "${fileUrl}", имя файла: "${fileName}"`);
				console.error(`   Доступные файлы пользователя ${userId}:`);
				const allUserFiles = await this.fileRepository.find({ where: { userId } });
				allUserFiles.forEach(f => console.error(`   - ${f.url} (id: ${f.id})`));
				throw new Error('File not found or you do not have permission to link it');
			}

			// Если файл уже связан с другим курсом, обновляем связь
			// Если файл не связан ни с каким курсом, создаем связь
			const previousCourseId = file.courseId;
			file.courseId = courseId;
			// Обновляем tag (раздел), если он передан
			if (tag !== undefined) {
				file.tag = tag || null;
			}
			const savedFile = await this.fileRepository.save(file);

			console.log(`🔗 Файл ${savedFile.id} (${savedFile.filename}) связан с курсом ${courseId}`);
			console.log(`   Предыдущий courseId: ${previousCourseId}, новый courseId: ${savedFile.courseId}`);
			
			// Проверяем, что файл действительно сохранен с правильным courseId
			const verifyFile = await this.fileRepository.findOne({ where: { id: savedFile.id } });
			if (verifyFile && verifyFile.courseId !== courseId) {
				console.error(`❌ ОШИБКА: Файл не был правильно связан с курсом! Ожидался courseId: ${courseId}, получен: ${verifyFile.courseId}`);
			} else {
				console.log(`✅ Подтверждено: файл ${savedFile.id} связан с курсом ${courseId}`);
			}
			
			return {
				id: savedFile.id,
				url: savedFile.url,
				createdAt: savedFile.createdAt,
			};
		} catch (error) {
			console.error('❌ Ошибка при связывании файла с курсом:', error);
			throw error;
		}
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
