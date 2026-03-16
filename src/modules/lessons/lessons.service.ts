import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    // Проверяем существование темы
    const topic = await this.prisma.topic.findUnique({
      where: { id: createLessonDto.topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${createLessonDto.topicId} not found`);
    }

    // Проверяем уникальность order в рамках темы
    const existingLesson = await this.prisma.lesson.findFirst({
      where: {
        topicId: createLessonDto.topicId,
        order: createLessonDto.order,
      },
    });

    if (existingLesson) {
      throw new ConflictException(`Lesson with order ${createLessonDto.order} already exists in this topic`);
    }

    const lesson = await this.prisma.lesson.create({
      data: createLessonDto,
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
    });
    return lesson;
  }

  async findAll(topicId?: string) {
    const where = topicId ? { topicId } : {};
    
    return this.prisma.lesson.findMany({
      where,
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        topic: {
          include: {
            subject: true,
            lessons: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async findByTopic(topicId: string) {
    return this.prisma.lesson.findMany({
      where: { topicId },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    try {
      // Если обновляем order, проверяем уникальность
      if (updateLessonDto.order && updateLessonDto.topicId) {
        const existingLesson = await this.prisma.lesson.findFirst({
          where: {
            topicId: updateLessonDto.topicId,
            order: updateLessonDto.order,
            NOT: { id },
          },
        });

        if (existingLesson) {
          throw new ConflictException(`Lesson with order ${updateLessonDto.order} already exists in this topic`);
        }
      }

      const lesson = await this.prisma.lesson.update({
        where: { id },
        data: updateLessonDto,
        include: {
          topic: true,
        },
      });
      return lesson;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.lesson.delete({
        where: { id },
      });
      return { message: 'Lesson deleted successfully' };
    } catch {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
  }

  async reorder(topicId: string, lessonOrders: { id: string; order: number }[]) {
    // Обновляем порядок уроков
    const updates = lessonOrders.map(({ id, order }) =>
      this.prisma.lesson.update({
        where: { id },
        data: { order },
      })
    );

    await Promise.all(updates);
    return this.findByTopic(topicId);
  }
}