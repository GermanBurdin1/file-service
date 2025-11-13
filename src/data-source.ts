import 'dotenv/config';
import { DataSource } from 'typeorm';
import { FileEntity } from './file/file.entity';
import { MaterialEntity } from './materials/material.entity';
import { HomeworkEntity } from './homework/homework.entity';


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgre',
  database: process.env.DB_NAME || 'db_file_service',
  synchronize: false,
  logging: true,
  entities: [FileEntity, MaterialEntity, HomeworkEntity],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
}); 