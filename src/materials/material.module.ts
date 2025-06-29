import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { MaterialEntity } from './material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialEntity])],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService, TypeOrmModule],
})
export class MaterialModule {} 