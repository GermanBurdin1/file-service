import { Controller, Post, UseInterceptors, UploadedFile, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';

// commande pour se connecter: ssh -L 5432:localhost:5432 -i "D:\keypem\my-ec2-key.pem" ec2-user@35.180.208.103
@Controller('files')
export class FileController {
	constructor(private readonly fileService: FileService) { }

	@Get()
  async getFilesByCourse(@Query('courseId') courseId: string) {
    // validation du courseId
    let validCourseId: number;
    if (!courseId || courseId.trim() === '' || isNaN(Number(courseId))) {
      validCourseId = 1; // ID par défaut
      console.log(`[FileController] courseId incorrect "${courseId}", utilisation de l'ID par défaut: 1`);
    } else {
      validCourseId = Number(courseId);
      console.log(`[FileController] Récupération des fichiers pour courseId: ${validCourseId}`);
    }
    
    return this.fileService.getFilesByCourse(validCourseId);
  }

	@Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('courseId') courseId: string,  // on reçoit comme string
  ) {
    console.log('[FileController] Demande d\'upload de fichier:', file.originalname, 'courseId:', courseId);
    // TODO : ajouter validation du type de fichier
    const result = await this.fileService.uploadFile(file, courseId);
    return result;
  }
}
