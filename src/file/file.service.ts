import { Injectable } from '@nestjs/common';
// imports AWS S3 (commenté pour le stockage local)
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';
// stockage local des fichiers
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  // client AWS S3 (commenté)
  // private s3 = new S3Client({
  //   region: process.env.AWS_REGION,
  //   credentials: {
  //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //   },
  // });

  // stockage local des fichiers
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {
    // on crée le dossier uploads s'il n'existe pas (pour le stockage local)
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, courseId: string): Promise<{ id: number; url: string; createdAt: Date }> {
    try {
      let fileUrl: string;
      
      // validation et transformation du courseId
      let validCourseId: number;
      if (!courseId || courseId.trim() === '') {
        validCourseId = 1; // ID par défaut pour les matériaux généraux
        console.log('[FileService] courseId vide, utilisation de l\'ID par défaut: 1');
      } else if (isNaN(Number(courseId))) {
        // si courseId n'est pas un nombre (ex: 'materials'), on utilise l'ID par défaut
        validCourseId = 1; 
        console.log(`[FileService] courseId "${courseId}" n'est pas un nombre, utilisation de l'ID par défaut: 1`);
      } else {
        validCourseId = Number(courseId);
        console.log(`[FileService] Utilisation du courseId: ${validCourseId}`);
      }
      
      // choix du mode de stockage via variable d'environnement
      const storageMode = process.env.STORAGE_MODE || 'local'; // 'local' ou 'aws'

      if (storageMode === 'aws') {
        // ==================== VERSION AWS S3 ====================
        console.log('[FileService] Utilisation du stockage AWS S3');
        // décommenter pour utiliser AWS S3:
        // const fileKey = `uploads/${uuidv4()}-${file.originalname}`;
        // fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
        // 
        // await this.s3.send(new PutObjectCommand({
        //   Bucket: process.env.AWS_S3_BUCKET_NAME,
        //   Key: fileKey,
        //   Body: file.buffer,
        //   ContentType: file.mimetype,
        // }));
        
        // PLACEHOLDER TEMPORAIRE (à supprimer lors du basculement vers AWS):
        throw new Error('Mode AWS S3 pas configuré. Décommentez le code ci-dessus et configurez les variables AWS.');
        
      } else {
        // ==================== VERSION STOCKAGE LOCAL (par défaut) ====================
        console.log('[FileService] Utilisation du stockage local');
        // on génère un nom de fichier unique
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(this.uploadPath, fileName);
        
        // sauvegarde du fichier en local
        fs.writeFileSync(filePath, file.buffer);
        
        // URL pour accéder au fichier
        fileUrl = `http://localhost:3008/uploads/${fileName}`;
        
        console.log('[FileService] Fichier sauvegardé localement:', filePath);
        console.log('[FileService] URL du fichier:', fileUrl);
      }

      // ==================== CODE COMMUN POUR LES DEUX VERSIONS ====================
      // sauvegarde en PostgreSQL
      const newFile = this.fileRepository.create({
        filename: file.originalname,
        url: fileUrl,
        mimetype: file.mimetype,
        courseId: validCourseId, // on utilise le courseId validé
      });

      const savedFile = await this.fileRepository.save(newFile);

      console.log('[FileService] Fichier sauvegardé avec succès en BDD avec courseId:', validCourseId);

      return {
        id: savedFile.id,
        url: savedFile.url,
        createdAt: savedFile.createdAt,
      };
    } catch (error) {
      console.error('[FileService] Erreur lors de l\'upload du fichier:', error);
      throw new Error(`Erreur lors de la sauvegarde du fichier: ${error.message}`);
    }
  }

  async getFilesByCourse(courseId: number): Promise<FileEntity[]> {
    return this.fileRepository.find({ where: { courseId } });
  }

  // méthode supplémentaire pour supprimer les fichiers (seulement pour stockage local)
  async deleteFile(fileId: number): Promise<boolean> {
    try {
      const file = await this.fileRepository.findOne({ where: { id: fileId } });
      if (!file) {
        return false;
      }

      // ==================== SUPPRESSION STOCKAGE LOCAL ====================
      // on extrait le nom du fichier depuis l'URL
      const fileName = path.basename(file.url);
      const filePath = path.join(this.uploadPath, fileName);

      // suppression du fichier physique
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // ==================== SUPPRESSION AWS S3 (commenté) ====================
      // const fileKey = file.url.split('.amazonaws.com/')[1];
      // await this.s3.send(new DeleteObjectCommand({
      //   Bucket: process.env.AWS_S3_BUCKET_NAME,
      //   Key: fileKey,
      // }));

      // suppression de l'enregistrement en BDD
      await this.fileRepository.delete(fileId);
      
      console.log('[FileService] Fichier supprimé:', filePath);
      return true;
    } catch (error) {
      console.error('[FileService] Erreur lors de la suppression du fichier:', error);
      // TODO : implémenter un système de retry pour les échecs de suppression
      return false;
    }
  }
}
