import { Controller, Get, Post, Body, Param, Delete, Patch, Query, Req } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto, AttachMaterialDto } from './material.dto';

@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  async getAllMaterials(@Req() req: any) {
    const userId = req.user?.sub;
    return this.materialService.getAllMaterials(userId);
  }

  @Get('teacher/:teacherId')
  async getMaterialsForTeacher(@Param('teacherId') teacherId: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.materialService.getMaterialsForTeacher(teacherId, userId);
  }

  @Get('student/:studentId')
  async getMaterialsForStudent(@Param('studentId') studentId: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.materialService.getMaterialsForStudent(studentId, userId);
  }

  @Get('lesson-materials/:userId')
  async getLessonMaterials(@Param('userId') userId: string, @Req() req: any) {
    const currentUserId = req.user?.sub;
    return this.materialService.getLessonMaterials(userId, currentUserId);
  }

  @Post()
  async createMaterial(@Body() createMaterialDto: CreateMaterialDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.materialService.createMaterial(createMaterialDto, userId);
  }

  @Post('attach')
  async attachMaterialToLesson(@Body() attachDto: AttachMaterialDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.materialService.attachMaterialToLesson(attachDto, userId);
  }

  @Delete(':materialId/lessons/:lessonId')
  async detachMaterialFromLesson(
    @Param('materialId') materialId: string,
    @Param('lessonId') lessonId: string,
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    return this.materialService.detachMaterialFromLesson(materialId, lessonId, userId);
  }

  @Delete(':id')
  async deleteMaterial(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.materialService.deleteMaterial(id, userId);
  }

  @Patch(':id')
  async updateMaterial(@Param('id') id: string, @Body() updates: any, @Req() req: any) {
    const userId = req.user?.sub;
    return this.materialService.updateMaterial(id, updates, userId);
  }

  @Get('search')
  async searchMaterials(@Query('query') query: string, @Req() req: any, @Query('type') type?: string) {
    const userId = req.user?.sub;
    return this.materialService.searchMaterials(query, type, userId);
  }
} 