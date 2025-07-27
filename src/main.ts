import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  console.log('DB_HOST from main.ts:', process.env.DB_HOST);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // ==================== CONFIGURATION STOCKAGE LOCAL (actif) ====================
  // configuration pour servir les fichiers statiques depuis le dossier uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  console.log('[FileService] Fichiers statiques disponibles sur: http://localhost:3008/uploads/');

  // ==================== CONFIGURATION AWS S3 (commenté) ====================
  // quand on utilise AWS S3, pas besoin de servir les fichiers statiquement
  // les fichiers seront accessibles directement via les URLs S3
  // pour basculer sur S3:
  // 1. décommenter les dépendances AWS dans package.json
  // 2. décommenter le code AWS dans file.service.ts
  // 3. ajouter les variables AWS dans .env:
  //    AWS_REGION=your-region
  //    AWS_ACCESS_KEY_ID=your-access-key
  //    AWS_SECRET_ACCESS_KEY=your-secret-key
  //    AWS_S3_BUCKET_NAME=your-bucket-name
  // 4. commenter le stockage local dans file.service.ts
  // 5. commenter app.useStaticAssets ci-dessus
	
  await app.listen(process.env.PORT || 3008);
  console.log('[FileService] Service démarré sur le port:', process.env.PORT || 3008);
  console.log('[FileService] Mode: Stockage local des fichiers (PostgreSQL + uploads/)');
  console.log('[FileService] Pour basculer sur AWS S3 voir commentaires dans main.ts');
  // TODO : ajouter un health check endpoint
}
bootstrap();
