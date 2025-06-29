export class CreateHomeworkDto {
  title: string;
  description: string;
  assignedBy: string;
  assignedByName: string;
  assignedTo: string;
  assignedToName: string;
  lessonId?: string;
  dueDate: Date;
  materialIds?: string[];
}

export class SubmitHomeworkDto {
  submission: string;
  submittedAt: Date;
  status: 'submitted';
}

export class UpdateHomeworkStatusDto {
  status: 'assigned' | 'submitted' | 'completed' | 'overdue';
}

export class HomeworkFilterDto {
  teacherId?: string;
  studentId?: string;
  status?: 'assigned' | 'submitted' | 'completed' | 'overdue';
  dateFrom?: Date;
  dateTo?: Date;
} 