import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async create(createTopicDto: CreateTopicDto) {
    // Проверяем существование предмета
    const subject = await this.prisma.subject.findUnique({
      where: { id: createTopicDto.subjectId },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${createTopicDto.subjectId} not found`);
    }

    // Проверяем, не существует ли уже тема с таким названием в этом предмете
    const existingTopic = await this.prisma.topic.findFirst({
      where: {
        name: createTopicDto.name,
        subjectId: createTopicDto.subjectId,
      },
    });

    if (existingTopic) {
      throw new ConflictException(`Topic with name "${createTopicDto.name}" already exists in this subject`);
    }

    const topic = await this.prisma.topic.create({
      data: createTopicDto,
      include: {
        subject: true,
      },
    });

    return topic;
  }

  async findAll() {
    return this.prisma.topic.findMany({
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { 
            questions: true,
            lessons: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: {
          select: {
            id: true,
            text: true,
            difficulty: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: { 
            questions: true,
            lessons: true,
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    return topic;
  }

  async findBySubject(subjectId: string) {
    return this.prisma.topic.findMany({
      where: { subjectId },
      include: {
        _count: {
          select: { 
            questions: true,
            lessons: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async update(id: string, updateTopicDto: UpdateTopicDto) {
    try {
      // Если обновляем subjectId, проверяем существование нового предмета
      if (updateTopicDto.subjectId) {
        const subject = await this.prisma.subject.findUnique({
          where: { id: updateTopicDto.subjectId },
        });
        if (!subject) {
          throw new NotFoundException(`Subject with ID ${updateTopicDto.subjectId} not found`);
        }
      }

      // Если обновляем имя, проверяем уникальность в рамках предмета
      if (updateTopicDto.name && updateTopicDto.subjectId) {
        const existingTopic = await this.prisma.topic.findFirst({
          where: {
            name: updateTopicDto.name,
            subjectId: updateTopicDto.subjectId,
            NOT: { id },
          },
        });

        if (existingTopic) {
          throw new ConflictException(`Topic with name "${updateTopicDto.name}" already exists in this subject`);
        }
      }

      const topic = await this.prisma.topic.update({
        where: { id },
        data: updateTopicDto,
        include: {
          subject: true,
        },
      });
      return topic;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      // Проверяем, есть ли связанные вопросы или уроки
      const topic = await this.prisma.topic.findUnique({
        where: { id },
        include: {
          _count: {
            select: { 
              questions: true,
              lessons: true,
            },
          },
        },
      });

      if (!topic) {
        throw new NotFoundException(`Topic with ID ${id} not found`);
      }

      if (topic._count.questions > 0) {
        throw new ConflictException(`Cannot delete topic with ${topic._count.questions} existing questions. Delete questions first.`);
      }

      if (topic._count.lessons > 0) {
        throw new ConflictException(`Cannot delete topic with ${topic._count.lessons} existing lessons. Delete lessons first.`);
      }

      await this.prisma.topic.delete({
        where: { id },
      });
      return { message: 'Topic deleted successfully' };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
  }

  async getStatistics(topicId: string) {
    const topic = await this.findOne(topicId);
    
    const stats = await this.prisma.$transaction([
      this.prisma.userProgress.aggregate({
        where: { topicId },
        _sum: {
          questionsAnswered: true,
          correctAnswers: true,
        },
        _count: {
          userId: true,
        },
      }),
      this.prisma.testResult.findMany({
        where: {
          test: {
            questions: {
              some: {
                topicId,
              },
            },
          },
        },
        select: {
          score: true,
          completedAt: true,
        },
      }),
    ]);

    const userStats = stats[0];
    const testResults = stats[1];

    // Безопасное извлечение значений с обработкой null
    const totalQuestions = topic._count?.questions ?? 0;
    const totalLessons = topic._count?.lessons ?? 0;
    const studentsPracticed = userStats._count?.userId ?? 0;
    const totalAnswers = userStats._sum?.questionsAnswered ?? 0;
    const totalCorrect = userStats._sum?.correctAnswers ?? 0;

    return {
      topicId: topic.id,
      topicName: topic.name,
      subjectName: topic.subject.name,
      totalQuestions,
      totalLessons,
      studentsPracticed,
      totalAnswers,
      totalCorrect,
      averageSuccessRate: totalAnswers > 0
        ? Math.round((totalCorrect / totalAnswers) * 100)
        : 0,
      averageTestScore: testResults.length > 0
        ? Math.round(testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length)
        : 0,
    };
  }
}