import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from './file/file.module';
import { MaterialModule } from './materials/material.module';
import { HomeworkModule } from './homework/homework.module';
import { join } from 'path';

console.log('Connexion à la base de données...');
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
			synchronize: process.env.NODE_ENV === 'development', // seulement pour le développement
			migrations: [__dirname + '/migrations/*.js'],
			migrationsRun: process.env.NODE_ENV === 'production', // auto-exécution des migrations en production
		}),
		FileModule, // module de gestion des fichiers
		MaterialModule, // module de gestion des matériaux
		HomeworkModule, // module de gestion des devoirs
	],
})

export class AppModule { }

