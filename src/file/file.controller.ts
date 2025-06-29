import { Controller, Post, UseInterceptors, UploadedFile, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';


// команда для подключения: ssh -L 5432:localhost:5432 -i "D:\keypem\my-ec2-key.pem" ec2-user@35.180.208.103
@Controller('files')
export class FileController {
	constructor(private readonly fileService: FileService) { }
	@Get()
  async getFilesByCourse(@Query('courseId') courseId: string) {
    // Валидация courseId
    let validCourseId: number;
    if (!courseId || courseId.trim() === '' || isNaN(Number(courseId))) {
      validCourseId = 1; // ID по умолчанию
      console.log(`⚠️ Некорректный courseId "${courseId}", используется ID по умолчанию: 1`);
    } else {
      validCourseId = Number(courseId);
      console.log(`✅ Получение файлов для courseId: ${validCourseId}`);
    }
    
    return this.fileService.getFilesByCourse(validCourseId);
  }

	@Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('courseId') courseId: string,  // ✅ Получаем как строку
  ) {
    console.log('📤 Запрос на загрузку файла:', file.originalname, 'courseId:', courseId);
    const result = await this.fileService.uploadFile(file, courseId);
    return result;
  }
}
