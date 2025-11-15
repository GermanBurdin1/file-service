import { Controller, Post, UseInterceptors, UploadedFile, Get, Query, Req, Body, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';


// команда для подключения: ssh -L 5432:localhost:5432 -i "D:\keypem\my-ec2-key.pem" ec2-user@35.180.208.103
@Controller('files')
export class FileController {
	constructor(private readonly fileService: FileService) { }
	@Get()
  async getFilesByCourse(@Query('courseId') courseId: string | number, @Req() req: any) {
    const userId = req.user?.sub;
    // Валидация courseId
    let validCourseId: number;
    
    // Преобразуем courseId в строку для проверки, если это не строка
    let courseIdStr = typeof courseId === 'string' ? courseId : String(courseId);
    
    // Обрабатываем случай, когда courseId может быть строкой с запятыми (например, "3,3")
    if (courseIdStr.includes(',')) {
      courseIdStr = courseIdStr.split(',')[0].trim();
      console.log(`⚠️ Обнаружено дублирование courseId, используется первое значение: ${courseIdStr}`);
    }
    
    if (!courseIdStr || courseIdStr.trim() === '' || isNaN(Number(courseIdStr))) {
      validCourseId = 1; // ID по умолчанию
      console.log(`⚠️ Некорректный courseId "${courseId}", используется ID по умолчанию: 1 для пользователя ${userId}`);
    } else {
      validCourseId = Number(courseIdStr);
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
    @Query('tag') tag: string | undefined,  // ✅ Получаем раздел (tag)
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    console.log('📤 Запрос на загрузку файла:', file.originalname, 'courseId:', courseId, 'tag:', tag, 'пользователем:', userId);
    const result = await this.fileService.uploadFileAsCourse(file, courseId, userId, tag);
    return result;
  }

  @Post('linkToCourse')
  async linkFileToCourse(
    @Body() body: { fileUrl: string; courseId: number; tag?: string },
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    const result = await this.fileService.linkFileToCourseByUrl(body.fileUrl, body.courseId, userId, body.tag);
    return result;
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Query('courseId') courseId: string | undefined, @Req() req: any) {
    const userId = req.user?.sub;
    const fileId = parseInt(id, 10);
    
    // Если передан courseId, удаляем только связь с курсом, а не сам файл
    if (courseId && !isNaN(Number(courseId))) {
      const validCourseId = Number(courseId);
      const removed = await this.fileService.removeFileFromCourse(fileId, validCourseId, userId);
      return { success: removed, removedFromCourse: true };
    }
    
    // Иначе удаляем файл полностью
    const deleted = await this.fileService.deleteFile(fileId, userId);
    return { success: deleted, removedFromCourse: false };
  }
}
