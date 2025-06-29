export class CreateMaterialDto {
  title: string;
  type: 'text' | 'audio' | 'video' | 'pdf' | 'image';
  content: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  tags: string[];
}

export class AttachMaterialDto {
  materialId: string;
  lessonId: string;
  teacherId: string;
  studentId: string;
} 