import { Test, TestingModule } from '@nestjs/testing';
import { MaterialService } from './material.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialEntity } from './material.entity';
import { CreateMaterialDto, AttachMaterialDto } from './material.dto';

describe('MaterialService', () => {
  let service: MaterialService;
  let repo: jest.Mocked<Repository<MaterialEntity>>;

  const mockMaterial: MaterialEntity = {
    id: '1',
    title: 'Test Material',
    type: 'pdf',
    content: 'Some content here',
    description: 'Test description',
    createdBy: 'teacher1',
    createdByName: 'Teacher Name',
    tags: ['tag1', 'tag2'],
    attachedLessons: [],
    createdAt: new Date(),
  } as MaterialEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        {
          provide: getRepositoryToken(MaterialEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockMaterial]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
    repo = module.get(getRepositoryToken(MaterialEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get all materials', async () => {
    repo.find.mockResolvedValue([mockMaterial]);
    const result = await service.getAllMaterials();
    expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' }, where: {} });
    expect(result).toEqual([mockMaterial]);
  });

  it('should get materials for teacher', async () => {
    repo.find.mockResolvedValue([mockMaterial]);
    const result = await service.getMaterialsForTeacher('teacher1');
    expect(repo.find).toHaveBeenCalledWith({
      where: { createdBy: 'teacher1' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual([mockMaterial]);
  });

  it('should get materials for student', async () => {
    repo.find.mockResolvedValue([mockMaterial]);
    const result = await service.getMaterialsForStudent('student1');
    expect(repo.find).toHaveBeenCalledWith({
      where: {},
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual([mockMaterial]);
  });

  it('should get lesson materials', async () => {
    const result = await service.getLessonMaterials('user1');
    expect(repo.createQueryBuilder).toHaveBeenCalled();
    expect(result).toEqual([mockMaterial]);
  });

  it('should create material', async () => {
    const dto: CreateMaterialDto = {
      title: 'New Material',
      type: 'pdf',
      content: 'Some PDF content',
      description: 'Description here',
      createdBy: 'user1',
      createdByName: 'Teacher Name',
      tags: ['tag1'],
    };

    repo.create.mockReturnValue(mockMaterial);
    repo.save.mockResolvedValue(mockMaterial);

    const result = await service.createMaterial(dto, 'user1');
    expect(repo.create).toHaveBeenCalledWith({
      ...dto,
      attachedLessons: [],
    });
    expect(repo.save).toHaveBeenCalledWith(mockMaterial);
    expect(result).toEqual(mockMaterial);
  });

  it('should attach material to lesson', async () => {
    const attachDto: AttachMaterialDto = {
      materialId: '1',
      lessonId: 'lesson1',
      teacherId: 'teacher1',
      studentId: 'student1',
    };

    repo.findOne.mockResolvedValue({ ...mockMaterial, attachedLessons: [] });
    repo.save.mockResolvedValue(mockMaterial);

    await service.attachMaterialToLesson(attachDto);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: attachDto.materialId } });
    expect(repo.save).toHaveBeenCalledWith({
      ...mockMaterial,
      attachedLessons: [attachDto.lessonId],
    });
  });

  it('should detach material from lesson', async () => {
    repo.findOne.mockResolvedValue({ ...mockMaterial, attachedLessons: ['lesson1', 'lesson2'] });
    repo.save.mockResolvedValue(mockMaterial);

    await service.detachMaterialFromLesson('1', 'lesson1');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(repo.save).toHaveBeenCalledWith({
      ...mockMaterial,
      attachedLessons: ['lesson2'],
    });
  });

  it('should delete material', async () => {
    repo.delete.mockResolvedValue({ affected: 1, raw: {} });
    await service.deleteMaterial('1');
    expect(repo.delete).toHaveBeenCalledWith('1');
  });
  

  it('should update material', async () => {
    const updates = { title: 'Updated Title' };
    repo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
    repo.findOne.mockResolvedValue({ ...mockMaterial, ...updates });

    const result = await service.updateMaterial('1', updates);
    expect(repo.update).toHaveBeenCalledWith('1', updates);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual({ ...mockMaterial, ...updates });
  });

  it('should search materials', async () => {
    repo.find.mockResolvedValue([mockMaterial]);
    const result = await service.searchMaterials('Test', 'pdf');
    expect(repo.find).toHaveBeenCalledWith({
      where: {
        title: expect.any(Object),
        type: 'pdf',
      },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual([mockMaterial]);
  });
});
