import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto, AttachMaterialDto } from './material.dto';

@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  async getAllMaterials() {
    return this.materialService.getAllMaterials();
  }

  @Get('teacher/:teacherId')
  async getMaterialsForTeacher(@Param('teacherId') teacherId: string) {
    return this.materialService.getMaterialsForTeacher(teacherId);
  }

  @Get('student/:studentId')
  async getMaterialsForStudent(@Param('studentId') studentId: string) {
    return this.materialService.getMaterialsForStudent(studentId);
  }

  @Get('lesson-materials/:userId')
  async getLessonMaterials(@Param('userId') userId: string) {
    return this.materialService.getLessonMaterials(userId);
  }

  @Post()
  async createMaterial(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialService.createMaterial(createMaterialDto);
  }

  @Post('attach')
  async attachMaterialToLesson(@Body() attachDto: AttachMaterialDto) {
    return this.materialService.attachMaterialToLesson(attachDto);
  }

  @Delete(':materialId/lessons/:lessonId')
  async detachMaterialFromLesson(
    @Param('materialId') materialId: string,
    @Param('lessonId') lessonId: string
  ) {
    return this.materialService.detachMaterialFromLesson(materialId, lessonId);
  }

  @Delete(':id')
  async deleteMaterial(@Param('id') id: string) {
    return this.materialService.deleteMaterial(id);
  }

  @Patch(':id')
  async updateMaterial(@Param('id') id: string, @Body() updates: any) {
    return this.materialService.updateMaterial(id, updates);
  }

  @Get('search')
  async searchMaterials(@Query('query') query: string, @Query('type') type?: string) {
    return this.materialService.searchMaterials(query, type);
  }
} 