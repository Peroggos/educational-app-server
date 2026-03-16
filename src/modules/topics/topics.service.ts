import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async create(createTopicDto: CreateTopicDto) {
    try {
      // Проверяем существование предмета
      const subject = await this.prisma.subject.findUnique({
        where: { id: createTopicDto.subjectId },
      });

      if (!subject) {
        throw new NotFoundException(`Subject with ID ${createTopicDto.subjectId} not found`);
      }

      const topic = await this.prisma.topic.create({
        data: createTopicDto,
        include: {
          subject: true,
        },
      });
      return topic;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Topic with this name already exists in the subject');
    }
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
          select: { questions: true },
        },
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
            options: true,
            explanation: true,
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
          select: { questions: true },
        },
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

      const topic = await this.prisma.topic.update({
        where: { id },
        data: updateTopicDto,
        include: {
          subject: true,
        },
      });
      return topic;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      // Проверяем, есть ли связанные вопросы
      const topic = await this.prisma.topic.findUnique({
        where: { id },
        include: {
          _count: {
            select: { questions: true },
          },
        },
      });

    if (topic?._count?.questions && topic._count.questions > 0) {
      throw new ConflictException('Cannot delete topic with existing questions');
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
}