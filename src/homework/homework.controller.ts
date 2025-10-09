import { Controller, Get, Post, Body, Param, Delete, Patch, Query, Req } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto, SubmitHomeworkDto, UpdateHomeworkStatusDto, HomeworkFilterDto } from './homework.dto';

@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post()
  async createHomework(@Body() createHomeworkDto: CreateHomeworkDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.homeworkService.createHomework(createHomeworkDto, userId);
  }

  @Get('teacher/:teacherId')
  async getHomeworkForTeacher(@Param('teacherId') teacherId: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.homeworkService.getHomeworkForTeacher(teacherId, userId);
  }

  @Get('student/:studentId')
  async getHomeworkForStudent(@Param('studentId') studentId: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.homeworkService.getHomeworkForStudent(studentId, userId);
  }

  @Patch(':id/submit')
  async submitHomework(@Param('id') id: string, @Body() submitDto: SubmitHomeworkDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.homeworkService.submitHomework(id, submitDto, userId);
  }

  @Patch(':id/grade')
  async gradeHomework(
    @Param('id') id: string,
    @Body() gradeData: { grade: number; feedback?: string },
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    return this.homeworkService.gradeHomework(id, gradeData.grade, gradeData.feedback, userId);
  }

  @Patch(':id/status')
  async updateHomeworkStatus(@Param('id') id: string, @Body() statusDto: UpdateHomeworkStatusDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.homeworkService.updateHomeworkStatus(id, statusDto, userId);
  }

  @Get('filter')
  async filterHomework(@Query() filters: HomeworkFilterDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.homeworkService.filterHomework(filters, userId);
  }

  @Delete(':id')
  async deleteHomework(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.homeworkService.deleteHomework(id, userId);
  }

  @Patch(':id')
  async updateHomework(@Param('id') id: string, @Body() updates: any, @Req() req: any) {
    const userId = req.user?.sub;
    return this.homeworkService.updateHomework(id, updates, userId);
  }
} 