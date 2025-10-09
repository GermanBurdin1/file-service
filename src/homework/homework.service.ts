import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HomeworkEntity } from './homework.entity';
import { CreateHomeworkDto, SubmitHomeworkDto, UpdateHomeworkStatusDto, HomeworkFilterDto } from './homework.dto';

@Injectable()
export class HomeworkService {
  constructor(
    @InjectRepository(HomeworkEntity)
    private homeworkRepository: Repository<HomeworkEntity>,
  ) {}

  async createHomework(createHomeworkDto: CreateHomeworkDto, userId: string): Promise<HomeworkEntity> {
    // Проверяем, что пользователь создает домашнее задание для себя как преподавателя
    if (createHomeworkDto.assignedBy !== userId) {
      throw new Error('Unauthorized: You can only create homework as yourself');
    }
    
    const homework = this.homeworkRepository.create({
      ...createHomeworkDto,
      materialIds: createHomeworkDto.materialIds || [],
      isLinkedToMaterials: (createHomeworkDto.materialIds?.length || 0) > 0,
    });
    return this.homeworkRepository.save(homework);
  }

  async getHomeworkForTeacher(teacherId: string, userId?: string): Promise<HomeworkEntity[]> {
    // Проверяем владение, если передан userId
    if (userId && teacherId !== userId) {
      throw new Error('Unauthorized: You can only view your own homework assignments');
    }
    
    return this.homeworkRepository.find({
      where: { assignedBy: teacherId },
      order: { assignedAt: 'DESC' }
    });
  }

  async getHomeworkForStudent(studentId: string, userId?: string): Promise<HomeworkEntity[]> {
    // Проверяем владение, если передан userId
    if (userId && studentId !== userId) {
      throw new Error('Unauthorized: You can only view your own homework');
    }
    
    return this.homeworkRepository.find({
      where: { assignedTo: studentId },
      order: { assignedAt: 'DESC' }
    });
  }

  async submitHomework(homeworkId: string, submitDto: SubmitHomeworkDto, userId: string): Promise<void> {
    // Проверяем, что пользователь является получателем домашнего задания
    const homework = await this.homeworkRepository.findOne({ where: { id: homeworkId } });
    if (!homework) {
      throw new Error('Homework not found');
    }
    
    if (homework.assignedTo !== userId) {
      throw new Error('Unauthorized: You can only submit your own homework');
    }
    
    await this.homeworkRepository.update(homeworkId, {
      submittedAt: submitDto.submittedAt,
      status: 'submitted'
    });
  }

  async gradeHomework(homeworkId: string, grade: number, feedback?: string, userId?: string): Promise<void> {
    // Проверяем, что пользователь является преподавателем, который назначил задание
    if (userId) {
      const homework = await this.homeworkRepository.findOne({ where: { id: homeworkId } });
      if (!homework) {
        throw new Error('Homework not found');
      }
      
      if (homework.assignedBy !== userId) {
        throw new Error('Unauthorized: You can only grade homework you assigned');
      }
    }
    
    await this.homeworkRepository.update(homeworkId, {
      grade,
      teacherFeedback: feedback,
      status: 'completed'
    });
  }

  async updateHomeworkStatus(homeworkId: string, statusDto: UpdateHomeworkStatusDto, userId?: string): Promise<void> {
    // Проверяем, что пользователь имеет право обновлять статус
    if (userId) {
      const homework = await this.homeworkRepository.findOne({ where: { id: homeworkId } });
      if (!homework) {
        throw new Error('Homework not found');
      }
      
      // Только назначивший преподаватель или получающий студент могут обновлять статус
      if (homework.assignedBy !== userId && homework.assignedTo !== userId) {
        throw new Error('Unauthorized: You can only update homework you assigned or received');
      }
    }
    
    await this.homeworkRepository.update(homeworkId, {
      status: statusDto.status
    });
  }

  async filterHomework(filters: HomeworkFilterDto, userId?: string): Promise<HomeworkEntity[]> {
    const whereCondition: any = {};

    // Проверяем, что пользователь может фильтровать только свои задания
    if (userId) {
      if (filters.teacherId && filters.teacherId !== userId) {
        throw new Error('Unauthorized: You can only filter your own homework assignments');
      }
      if (filters.studentId && filters.studentId !== userId) {
        throw new Error('Unauthorized: You can only filter your own homework');
      }
      
      // Если не указаны фильтры, показываем только задания пользователя
      if (!filters.teacherId && !filters.studentId) {
        whereCondition.assignedBy = userId;
        whereCondition.assignedTo = userId;
      }
    }

    if (filters.teacherId) {
      whereCondition.assignedBy = filters.teacherId;
    }

    if (filters.studentId) {
      whereCondition.assignedTo = filters.studentId;
    }

    if (filters.status) {
      whereCondition.status = filters.status;
    }

    if (filters.dateFrom && filters.dateTo) {
      whereCondition.assignedAt = Between(filters.dateFrom, filters.dateTo);
    }

    return this.homeworkRepository.find({
      where: whereCondition,
      order: { assignedAt: 'DESC' }
    });
  }

  async deleteHomework(id: string, userId?: string): Promise<void> {
    // Проверяем, что пользователь является назначившим преподавателем
    if (userId) {
      const homework = await this.homeworkRepository.findOne({ where: { id } });
      if (!homework) {
        throw new Error('Homework not found');
      }
      
      if (homework.assignedBy !== userId) {
        throw new Error('Unauthorized: You can only delete homework you assigned');
      }
    }
    
    await this.homeworkRepository.delete(id);
  }

  async updateHomework(id: string, updates: Partial<HomeworkEntity>, userId?: string): Promise<HomeworkEntity> {
    // Проверяем, что пользователь является назначившим преподавателем
    if (userId) {
      const homework = await this.homeworkRepository.findOne({ where: { id } });
      if (!homework) {
        throw new Error('Homework not found');
      }
      
      if (homework.assignedBy !== userId) {
        throw new Error('Unauthorized: You can only update homework you assigned');
      }
    }
    
    await this.homeworkRepository.update(id, updates);
    return this.homeworkRepository.findOne({ where: { id } });
  }
} 