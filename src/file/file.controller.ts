import { Controller, Post, UseInterceptors, UploadedFile, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';


// команда для подключения: ssh -L 5432:localhost:5432 -i "D:\keypem\my-ec2-key.pem" ec2-user@35.180.208.103
@Controller('files')
export class FileController {
	constructor(private readonly fileService: FileService) { }
	@Get()
  async getFilesByCourse(@Query('courseId') courseId: string) {
    return this.fileService.getFilesByCourse(Number(courseId)); // ✅ Преобразуем в число
  }

	@Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('courseId') courseId: string,  // ✅ Получаем как строку
  ) {
    const result = await this.fileService.uploadFile(file, courseId);
    return result;
  }
}
