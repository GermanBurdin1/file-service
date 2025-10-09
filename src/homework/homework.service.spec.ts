import { Test, TestingModule } from '@nestjs/testing';
import { HomeworkService } from './homework.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { HomeworkEntity } from './homework.entity';
import {
  CreateHomeworkDto,
  SubmitHomeworkDto,
  UpdateHomeworkStatusDto,
  HomeworkFilterDto,
} from './homework.dto';

describe('HomeworkService', () => {
  let service: HomeworkService;
  let repo: jest.Mocked<Repository<HomeworkEntity>>;

  const mockHomework = {
    id: '1',
    title: 'Test Homework',
    assignedBy: 'teacher1',
    assignedTo: 'student1',
    status: 'assigned',
    materialIds: [],
    isLinkedToMaterials: false,
  } as HomeworkEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeworkService,
        {
          provide: getRepositoryToken(HomeworkEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HomeworkService>(HomeworkService);
    repo = module.get(getRepositoryToken(HomeworkEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create homework', async () => {
    const dto: CreateHomeworkDto = {
      title: 'Test Homework',
      description: 'Test description',
      assignedBy: 'user1',
      assignedByName: 'Teacher One',
      assignedTo: 'student1',
      assignedToName: 'Student One',
      dueDate: new Date(),
      materialIds: [],
    };

    repo.create.mockReturnValue(mockHomework);
    repo.save.mockResolvedValue(mockHomework);

    const result = await service.createHomework(dto, 'user1');
    expect(repo.create).toHaveBeenCalledWith({
      ...dto,
      materialIds: [],
      isLinkedToMaterials: false,
    });
    expect(repo.save).toHaveBeenCalledWith(mockHomework);
    expect(result).toEqual(mockHomework);
  });

  it('should get homework for teacher', async () => {
    repo.find.mockResolvedValue([mockHomework]);
    const result = await service.getHomeworkForTeacher('teacher1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { assignedBy: 'teacher1' },
      order: { assignedAt: 'DESC' },
    });
    expect(result).toEqual([mockHomework]);
  });

  it('should get homework for student', async () => {
    repo.find.mockResolvedValue([mockHomework]);
    const result = await service.getHomeworkForStudent('student1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { assignedTo: 'student1' },
      order: { assignedAt: 'DESC' },
    });
    expect(result).toEqual([mockHomework]);
  });

  it('should submit homework', async () => {
    const dto: SubmitHomeworkDto = {
      submission: 'My submission text',
      submittedAt: new Date(),
      status: 'submitted',
    };
    
    const mockHomework = {
      id: '1',
      title: 'Test Homework',
      description: 'Test description',
      assignedBy: 'teacher1',
      assignedByName: 'Teacher One',
      assignedTo: 'user1',
      assignedToName: 'Student One',
      dueDate: new Date(),
      materialIds: [],
      isLinkedToMaterials: false,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
    
    repo.findOne.mockResolvedValue(mockHomework);
    repo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as UpdateResult);
    await service.submitHomework('1', dto, 'user1');
    expect(repo.update).toHaveBeenCalledWith('1', {
      submittedAt: dto.submittedAt,
      status: 'submitted',
    });
  });

  it('should grade homework', async () => {
    repo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as UpdateResult);
    await service.gradeHomework('1', 95, 'Good job!');
    expect(repo.update).toHaveBeenCalledWith('1', {
      grade: 95,
      teacherFeedback: 'Good job!',
      status: 'completed',
    });
  });

  it('should update homework status', async () => {
    const dto: UpdateHomeworkStatusDto = { status: 'completed' };
    repo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as UpdateResult);
    await service.updateHomeworkStatus('1', dto);
    expect(repo.update).toHaveBeenCalledWith('1', { status: dto.status });
  });

  it('should filter homework', async () => {
    repo.find.mockResolvedValue([mockHomework]);
    const filters: HomeworkFilterDto = {
      teacherId: 'teacher1',
      studentId: 'student1',
      status: 'assigned',
      dateFrom: new Date('2023-01-01'),
      dateTo: new Date('2023-12-31'),
    };
    const result = await service.filterHomework(filters);
    expect(repo.find).toHaveBeenCalledWith({
      where: {
        assignedBy: filters.teacherId,
        assignedTo: filters.studentId,
        status: filters.status,
        assignedAt: expect.any(Object),
      },
      order: { assignedAt: 'DESC' },
    });
    expect(result).toEqual([mockHomework]);
  });

  it('should delete homework', async () => {
    repo.delete.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as DeleteResult);
    await service.deleteHomework('1');
    expect(repo.delete).toHaveBeenCalledWith('1');
  });

  it('should update homework', async () => {
    const updates = { title: 'Updated Title' };
    repo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] } as UpdateResult);
    repo.findOne.mockResolvedValue({ ...mockHomework, ...updates });
    const result = await service.updateHomework('1', updates);
    expect(repo.update).toHaveBeenCalledWith('1', updates);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual({ ...mockHomework, ...updates });
  });
});
