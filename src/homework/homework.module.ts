import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkController } from './homework.controller';
import { HomeworkService } from './homework.service';
import { HomeworkEntity } from './homework.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HomeworkEntity])],
  controllers: [HomeworkController],
  providers: [HomeworkService],
  exports: [HomeworkService, TypeOrmModule],
})
export class HomeworkModule {} 