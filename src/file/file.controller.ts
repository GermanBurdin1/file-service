import { Controller, Post, UseInterceptors, UploadedFile, Get, Query, Req, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';


// команда для подключения: ssh -L 5432:localhost:5432 -i "D:\keypem\my-ec2-key.pem" ec2-user@35.180.208.103
@Controller('files')
export class FileController {
	constructor(private readonly fileService: FileService) { }
	@Get()
  async getFilesByCourse(@Query('courseId') courseId: string, @Req() req: any) {
    const userId = req.user?.sub;
    // Валидация courseId
    let validCourseId: number;
    if (!courseId || courseId.trim() === '' || isNaN(Number(courseId))) {
      validCourseId = 1; // ID по умолчанию
      console.log(`⚠️ Некорректный courseId "${courseId}", используется ID по умолчанию: 1 для пользователя ${userId}`);
    } else {
      validCourseId = Number(courseId);
      console.log(`✅ Получение файлов для courseId: ${validCourseId} пользователем ${userId}`);
    }
    
    return this.fileService.getFilesByCourse(validCourseId, userId);
  }

	@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Body('courseId') courseIdRaw: string | undefined,
  @Req() req: any
) {
  const userId = req.user?.sub;

  let courseId: number | null = null;
  if (courseIdRaw !== undefined && courseIdRaw !== null && courseIdRaw !== '') {
    const parsed = Number(courseIdRaw);
    if (!Number.isNaN(parsed)) {
      courseId = parsed;
    }
  }

  console.log(
    '📤 Запрос на загрузку файла:',
    file.originalname,
    'пользователем:',
    userId,
    'courseId:',
    courseId
  );

  const result = await this.fileService.uploadFile(file, userId, courseId);
  return result;
}


	@Post('uploadAsCourse')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileAsCourse(
    @UploadedFile() file: Express.Multer.File,
    @Query('courseId') courseId: string,  // ✅ Получаем как строку
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    console.log('📤 Запрос на загрузку файла:', file.originalname, 'courseId:', courseId, 'пользователем:', userId);
    const result = await this.fileService.uploadFileAsCourse(file, courseId, userId);
    return result;
  }
}
