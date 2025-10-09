import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MaterialEntity } from './material.entity';
import { CreateMaterialDto, AttachMaterialDto } from './material.dto';

@Injectable()
export class MaterialService {
  private readonly logger = new Logger(MaterialService.name);

  constructor(
    @InjectRepository(MaterialEntity)
    private materialRepository: Repository<MaterialEntity>,
  ) {}

  async getAllMaterials(userId?: string): Promise<MaterialEntity[]> {
    // Если передан userId, показываем только материалы пользователя
    const whereCondition = userId ? { createdBy: userId } : {};
    
    return this.materialRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' }
    });
  }

  async getMaterialsForTeacher(teacherId: string, userId?: string): Promise<MaterialEntity[]> {
    // Проверяем владение, если передан userId
    if (userId && teacherId !== userId) {
      throw new Error('Unauthorized: You can only view your own materials');
    }
    
    return this.materialRepository.find({
      where: { createdBy: teacherId },
      order: { createdAt: 'DESC' }
    });
  }

  async getMaterialsForStudent(studentId: string, userId?: string): Promise<MaterialEntity[]> {
    // Проверяем владение, если передан userId
    if (userId && studentId !== userId) {
      throw new Error('Unauthorized: You can only view your own materials');
    }
    
    // Возвращаем материалы, прикрепленные к урокам студента
    this.logger.log(`📚 Получение материалов для студента: ${studentId}`);
    return this.materialRepository.find({
      where: {},  // TODO: Добавить логику фильтрации по урокам студента
      order: { createdAt: 'DESC' }
    });
  }

  async getLessonMaterials(userId: string, currentUserId?: string): Promise<MaterialEntity[]> {
    // Проверяем владение, если передан currentUserId
    if (currentUserId && userId !== currentUserId) {
      throw new Error('Unauthorized: You can only view your own lesson materials');
    }
    
    // Возвращаем материалы, которые прикреплены к урокам пользователя
    this.logger.log(`📚 Получение материалов уроков для пользователя: ${userId}`);
    return this.materialRepository
      .createQueryBuilder('material')
      .where('material.attachedLessons != :emptyArray', { emptyArray: '[]' })
      .andWhere('material.attachedLessons IS NOT NULL')
      .andWhere('material.attachedLessons != :emptyString', { emptyString: '' })
      .orderBy('material.createdAt', 'DESC')
      .getMany();
  }

  async createMaterial(createMaterialDto: CreateMaterialDto, userId: string): Promise<MaterialEntity> {
    // Проверяем, что пользователь создает материал для себя
    if (createMaterialDto.createdBy !== userId) {
      throw new Error('Unauthorized: You can only create materials for yourself');
    }
    
    const material = this.materialRepository.create({
      ...createMaterialDto,
      attachedLessons: [],
    });
    return this.materialRepository.save(material);
  }

  async attachMaterialToLesson(attachDto: AttachMaterialDto, userId?: string): Promise<void> {
    const material = await this.materialRepository.findOne({
      where: { id: attachDto.materialId }
    });
    
    if (!material) {
      throw new Error('Material not found');
    }
    
    // Проверяем, что пользователь является создателем материала
    if (userId && material.createdBy !== userId) {
      throw new Error('Unauthorized: You can only attach materials you created');
    }
    
    if (!material.attachedLessons.includes(attachDto.lessonId)) {
      material.attachedLessons.push(attachDto.lessonId);
      await this.materialRepository.save(material);
    }
  }

  async detachMaterialFromLesson(materialId: string, lessonId: string, userId?: string): Promise<void> {
    const material = await this.materialRepository.findOne({
      where: { id: materialId }
    });
    
    if (!material) {
      throw new Error('Material not found');
    }
    
    // Проверяем, что пользователь является создателем материала
    if (userId && material.createdBy !== userId) {
      throw new Error('Unauthorized: You can only detach materials you created');
    }
    
    material.attachedLessons = material.attachedLessons.filter(id => id !== lessonId);
    await this.materialRepository.save(material);
  }

  async deleteMaterial(id: string, userId?: string): Promise<void> {
    // Проверяем, что пользователь является создателем материала
    if (userId) {
      const material = await this.materialRepository.findOne({ where: { id } });
      if (!material) {
        throw new Error('Material not found');
      }
      
      if (material.createdBy !== userId) {
        throw new Error('Unauthorized: You can only delete materials you created');
      }
    }
    
    await this.materialRepository.delete(id);
  }

  async updateMaterial(id: string, updates: Partial<MaterialEntity>, userId?: string): Promise<MaterialEntity> {
    // Проверяем, что пользователь является создателем материала
    if (userId) {
      const material = await this.materialRepository.findOne({ where: { id } });
      if (!material) {
        throw new Error('Material not found');
      }
      
      if (material.createdBy !== userId) {
        throw new Error('Unauthorized: You can only update materials you created');
      }
    }
    
    await this.materialRepository.update(id, updates);
    return this.materialRepository.findOne({ where: { id } });
  }

  async searchMaterials(query: string, type?: string, userId?: string): Promise<MaterialEntity[]> {
    const whereCondition: any = {
      title: Like(`%${query}%`)
    };
    
    // Если передан userId, ищем только среди материалов пользователя
    if (userId) {
      whereCondition.createdBy = userId;
    }
    
    if (type) {
      whereCondition.type = type;
    }
    
    return this.materialRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' }
    });
  }
} 