import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator'

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Body() createLessonDto: CreateLessonDto) {
  console.log('Received lesson data:', createLessonDto); 
  return this.lessonsService.create(createLessonDto);
}

  @Get()
  findAll(@Query('topicId') topicId?: string) {
    return this.lessonsService.findAll(topicId);
  }

  @Get('topic/:topicId')
  findByTopic(@Param('topicId') topicId: string) {
    return this.lessonsService.findByTopic(topicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Patch('reorder/:topicId')
  @Roles(Role.ADMIN, Role.TEACHER)
  reorder(
    @Param('topicId') topicId: string,
    @Body() lessonOrders: { id: string; order: number }[],
  ) {
    return this.lessonsService.reorder(topicId, lessonOrders);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }
}