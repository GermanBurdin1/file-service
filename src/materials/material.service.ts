import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MaterialEntity } from './material.entity';
import { CreateMaterialDto, AttachMaterialDto } from './material.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(MaterialEntity)
    private materialRepository: Repository<MaterialEntity>,
  ) {}

  async getAllMaterials(): Promise<MaterialEntity[]> {
    return this.materialRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async getMaterialsForTeacher(teacherId: string): Promise<MaterialEntity[]> {
    return this.materialRepository.find({
      where: { createdBy: teacherId },
      order: { createdAt: 'DESC' }
    });
  }

  async getMaterialsForStudent(studentId: string): Promise<MaterialEntity[]> {
    // Возвращаем материалы, прикрепленные к урокам студента
    return this.materialRepository.find({
      where: {},  // Можно добавить логику фильтрации по урокам студента
      order: { createdAt: 'DESC' }
    });
  }

  async getLessonMaterials(userId: string): Promise<MaterialEntity[]> {
    // Возвращаем материалы, которые прикреплены к урокам пользователя
    return this.materialRepository
      .createQueryBuilder('material')
      .where('material.attachedLessons != :emptyArray', { emptyArray: '[]' })
      .andWhere('material.attachedLessons IS NOT NULL')
      .andWhere('material.attachedLessons != :emptyString', { emptyString: '' })
      .orderBy('material.createdAt', 'DESC')
      .getMany();
  }

  async createMaterial(createMaterialDto: CreateMaterialDto): Promise<MaterialEntity> {
    const material = this.materialRepository.create({
      ...createMaterialDto,
      attachedLessons: [],
    });
    return this.materialRepository.save(material);
  }

  async attachMaterialToLesson(attachDto: AttachMaterialDto): Promise<void> {
    const material = await this.materialRepository.findOne({
      where: { id: attachDto.materialId }
    });
    
    if (material) {
      if (!material.attachedLessons.includes(attachDto.lessonId)) {
        material.attachedLessons.push(attachDto.lessonId);
        await this.materialRepository.save(material);
      }
    }
  }

  async detachMaterialFromLesson(materialId: string, lessonId: string): Promise<void> {
    const material = await this.materialRepository.findOne({
      where: { id: materialId }
    });
    
    if (material) {
      material.attachedLessons = material.attachedLessons.filter(id => id !== lessonId);
      await this.materialRepository.save(material);
    }
  }

  async deleteMaterial(id: string): Promise<void> {
    await this.materialRepository.delete(id);
  }

  async updateMaterial(id: string, updates: Partial<MaterialEntity>): Promise<MaterialEntity> {
    await this.materialRepository.update(id, updates);
    return this.materialRepository.findOne({ where: { id } });
  }

  async searchMaterials(query: string, type?: string): Promise<MaterialEntity[]> {
    const whereCondition: any = {
      title: Like(`%${query}%`)
    };
    
    if (type) {
      whereCondition.type = type;
    }
    
    return this.materialRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' }
    });
  }
} 