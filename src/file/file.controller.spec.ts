import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';

const mockFileService = {
  getFilesByCourse: jest.fn(),
  uploadFile: jest.fn(),
};

describe('FileController', () => {
  let controller: FileController;
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    controller = module.get<FileController>(FileController);
    service = module.get<FileService>(FileService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFilesByCourse', () => {
    it('should use default ID if invalid courseId', async () => {
      const files = [{ id: 1, name: 'file1.pdf' }];
      service.getFilesByCourse = jest.fn().mockResolvedValue(files);

      const mockReq = { user: { sub: 'user1' } };
      const result = await controller.getFilesByCourse('', mockReq);
      expect(service.getFilesByCourse).toHaveBeenCalledWith(1, 'user1');
      expect(result).toEqual(files);
    });

    it('should convert valid courseId to number', async () => {
      const files = [{ id: 2, name: 'file2.pdf' }];
      service.getFilesByCourse = jest.fn().mockResolvedValue(files);

      const mockReq = { user: { sub: 'user1' } };
      const result = await controller.getFilesByCourse('42', mockReq);
      expect(service.getFilesByCourse).toHaveBeenCalledWith(42, 'user1');
      expect(result).toEqual(files);
    });

    it('should fallback to default if courseId is NaN', async () => {
      const files = [{ id: 3, name: 'file3.pdf' }];
      service.getFilesByCourse = jest.fn().mockResolvedValue(files);

      const mockReq = { user: { sub: 'user1' } };
      const result = await controller.getFilesByCourse('invalid', mockReq);
      expect(service.getFilesByCourse).toHaveBeenCalledWith(1, 'user1');
      expect(result).toEqual(files);
    });
  });

  describe('uploadFile', () => {
    it('should call service.uploadFile with file and courseId', async () => {
      const fileMock: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1234,
        destination: '/uploads',
        filename: 'test.pdf',
        path: '/uploads/test.pdf',
        buffer: Buffer.from('test'),
        stream: {} as any,
      };

      const resultMock = { success: true, url: '/uploads/test.pdf' };
      service.uploadFile = jest.fn().mockResolvedValue(resultMock);

      const mockReq = { user: { sub: 'user1' } };
      const result = await controller.uploadFile(fileMock, '5', mockReq);
      expect(service.uploadFile).toHaveBeenCalledWith(fileMock, '5', 'user1');
      expect(result).toEqual(resultMock);
    });
  });
});
