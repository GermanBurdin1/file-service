// Полифилл для crypto в Node.js 18
import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}



import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from './file/file.module';
import { MaterialModule } from './materials/material.module';
import { HomeworkModule } from './homework/homework.module';
import { join } from 'path';

console.log('Подключение к базе данных...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: join(__dirname, '..', '.env'),
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST,
			port: Number(process.env.DB_PORT),
			username: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
			entities: [__dirname + '/**/*.entity{.ts,.js}'],
			synchronize: process.env.NODE_ENV === 'development', // Только для разработки
			migrations: [__dirname + '/migrations/*.js'],
			migrationsRun: process.env.NODE_ENV === 'production', // Автозапуск миграций в продакшене
		}),
		FileModule, // Подключаем FileModule
		MaterialModule, // Подключаем MaterialModule
		HomeworkModule, // Подключаем HomeworkModule
	],
})

export class AppModule { }

