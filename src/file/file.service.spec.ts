import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileEntity } from './file.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Создаем мок для репозитория
const mockFileRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

describe('FileService', () => {
  let service: FileService;
  let repo: jest.Mocked<Repository<FileEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: getRepositoryToken(FileEntity),
          useFactory: mockFileRepo,
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    repo = module.get(getRepositoryToken(FileEntity));

    // Мокаем функции fs для локального хранения
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file and save to repo', async () => {
      const mockFile = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('test data'),
      } as Express.Multer.File;

      const mockSavedFile = {
        id: 1,
        url: 'http://localhost:3008/uploads/test.txt',
        createdAt: new Date(),
      } as any;

      repo.create.mockReturnValue(mockSavedFile);
      repo.save.mockResolvedValue(mockSavedFile);

      const result = await service.uploadFile(mockFile, '2');

      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledWith(mockSavedFile);
      expect(result).toHaveProperty('id', mockSavedFile.id);
      expect(result).toHaveProperty('url', mockSavedFile.url);
    });

    it('should fallback to default courseId if empty', async () => {
      const mockFile = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('test data'),
      } as Express.Multer.File;

      const mockSavedFile = {
        id: 1,
        url: 'http://localhost:3008/uploads/test.txt',
        createdAt: new Date(),
      } as any;

      repo.create.mockReturnValue(mockSavedFile);
      repo.save.mockResolvedValue(mockSavedFile);

      const result = await service.uploadFile(mockFile, '');

      expect(repo.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', mockSavedFile.id);
      expect(result).toHaveProperty('url', mockSavedFile.url);
    });
  });

  describe('getFilesByCourse', () => {
    it('should return files by course', async () => {
      const files = [{ id: 1, filename: 'file1' }] as FileEntity[];
      repo.find.mockResolvedValue(files);

      const result = await service.getFilesByCourse(1);
      expect(result).toEqual(files);
      expect(repo.find).toHaveBeenCalledWith({ where: { courseId: 1 } });
    });
  });

  describe('deleteFile', () => {
    it('should delete file if exists', async () => {
      const file = { id: 1, url: 'http://localhost:3008/uploads/test.txt' } as FileEntity;
      repo.findOne.mockResolvedValue(file);

      repo.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.deleteFile(1);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(repo.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      repo.findOne.mockResolvedValue(undefined);

      const result = await service.deleteFile(999);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBe(false);
    });
  });
});
