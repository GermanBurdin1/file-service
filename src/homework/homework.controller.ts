import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto, SubmitHomeworkDto, UpdateHomeworkStatusDto, HomeworkFilterDto } from './homework.dto';

@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post()
  async createHomework(@Body() createHomeworkDto: CreateHomeworkDto) {
    return this.homeworkService.createHomework(createHomeworkDto);
  }

  @Get('teacher/:teacherId')
  async getHomeworkForTeacher(@Param('teacherId') teacherId: string) {
    return this.homeworkService.getHomeworkForTeacher(teacherId);
  }

  @Get('student/:studentId')
  async getHomeworkForStudent(@Param('studentId') studentId: string) {
    return this.homeworkService.getHomeworkForStudent(studentId);
  }

  @Patch(':id/submit')
  async submitHomework(@Param('id') id: string, @Body() submitDto: SubmitHomeworkDto) {
    return this.homeworkService.submitHomework(id, submitDto);
  }

  @Patch(':id/grade')
  async gradeHomework(
    @Param('id') id: string,
    @Body() gradeData: { grade: number; feedback?: string }
  ) {
    return this.homeworkService.gradeHomework(id, gradeData.grade, gradeData.feedback);
  }

  @Patch(':id/status')
  async updateHomeworkStatus(@Param('id') id: string, @Body() statusDto: UpdateHomeworkStatusDto) {
    return this.homeworkService.updateHomeworkStatus(id, statusDto);
  }

  @Get('filter')
  async filterHomework(@Query() filters: HomeworkFilterDto) {
    return this.homeworkService.filterHomework(filters);
  }

  @Delete(':id')
  async deleteHomework(@Param('id') id: string) {
    return this.homeworkService.deleteHomework(id);
  }

  @Patch(':id')
  async updateHomework(@Param('id') id: string, @Body() updates: any) {
    return this.homeworkService.updateHomework(id, updates);
  }
} 