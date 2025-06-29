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

  async createHomework(createHomeworkDto: CreateHomeworkDto): Promise<HomeworkEntity> {
    const homework = this.homeworkRepository.create({
      ...createHomeworkDto,
      materialIds: createHomeworkDto.materialIds || [],
      isLinkedToMaterials: (createHomeworkDto.materialIds?.length || 0) > 0,
    });
    return this.homeworkRepository.save(homework);
  }

  async getHomeworkForTeacher(teacherId: string): Promise<HomeworkEntity[]> {
    return this.homeworkRepository.find({
      where: { assignedBy: teacherId },
      order: { assignedAt: 'DESC' }
    });
  }

  async getHomeworkForStudent(studentId: string): Promise<HomeworkEntity[]> {
    return this.homeworkRepository.find({
      where: { assignedTo: studentId },
      order: { assignedAt: 'DESC' }
    });
  }

  async submitHomework(homeworkId: string, submitDto: SubmitHomeworkDto): Promise<void> {
    await this.homeworkRepository.update(homeworkId, {
      submittedAt: submitDto.submittedAt,
      status: 'submitted'
    });
  }

  async gradeHomework(homeworkId: string, grade: number, feedback?: string): Promise<void> {
    await this.homeworkRepository.update(homeworkId, {
      grade,
      teacherFeedback: feedback,
      status: 'completed'
    });
  }

  async updateHomeworkStatus(homeworkId: string, statusDto: UpdateHomeworkStatusDto): Promise<void> {
    await this.homeworkRepository.update(homeworkId, {
      status: statusDto.status
    });
  }

  async filterHomework(filters: HomeworkFilterDto): Promise<HomeworkEntity[]> {
    const whereCondition: any = {};

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

  async deleteHomework(id: string): Promise<void> {
    await this.homeworkRepository.delete(id);
  }

  async updateHomework(id: string, updates: Partial<HomeworkEntity>): Promise<HomeworkEntity> {
    await this.homeworkRepository.update(id, updates);
    return this.homeworkRepository.findOne({ where: { id } });
  }
} 