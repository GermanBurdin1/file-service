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

  // ==================== LOCAL FILE STORAGE CONFIGURATION (активно) ====================
  // Настройка статической подачи файлов из папки uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  console.log('📁 Статические файлы доступны по: http://localhost:3008/uploads/');

  // ==================== AWS S3 CONFIGURATION (закомментировано) ====================
  // При использовании AWS S3 статическая подача файлов не нужна
  // Файлы будут доступны напрямую через S3 URLs
  // Для переключения на S3:
  // 1. Раскомментировать AWS зависимости в package.json
  // 2. Раскомментировать AWS код в file.service.ts
  // 3. Добавить AWS переменные в .env:
  //    AWS_REGION=your-region
  //    AWS_ACCESS_KEY_ID=your-access-key
  //    AWS_SECRET_ACCESS_KEY=your-secret-key
  //    AWS_S3_BUCKET_NAME=your-bucket-name
  // 4. Закомментировать локальное хранение в file.service.ts
  // 5. Закомментировать app.useStaticAssets выше
	
  await app.listen(process.env.PORT || 3008);
  console.log('🚀 File-service запущен на порту:', process.env.PORT || 3008);
  console.log('💾 Режим: Локальное хранение файлов (PostgreSQL + uploads/)');
  console.log('📝 Для переключения на AWS S3 см. комментарии в main.ts');
}
bootstrap();
