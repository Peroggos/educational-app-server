import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    // Проверяем существование темы
    const topic = await this.prisma.topic.findUnique({
      where: { id: createQuestionDto.topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${createQuestionDto.topicId} not found`);
    }

    // Проверяем корректность индекса правильного ответа
    if (createQuestionDto.correctOption >= createQuestionDto.options.length) {
      throw new ConflictException('Correct option index must be less than options length');
    }

    const question = await this.prisma.question.create({
      data: createQuestionDto,
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
    });
    return question;
  }

  async findAll(topicId?: string) {
    const where = topicId ? { topicId } : {};
    
    return this.prisma.question.findMany({
      where,
      include: {
        topic: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async findByTopic(topicId: string) {
    return this.prisma.question.findMany({
      where: { topicId },
      orderBy: {
        difficulty: 'asc',
      },
    });
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    try {
      // Если обновляем topicId, проверяем существование новой темы
      if (updateQuestionDto.topicId) {
        const topic = await this.prisma.topic.findUnique({
          where: { id: updateQuestionDto.topicId },
        });
        if (!topic) {
          throw new NotFoundException(`Topic with ID ${updateQuestionDto.topicId} not found`);
        }
      }

      // Если обновляем options, проверяем корректность correctOption
      if (updateQuestionDto.options && updateQuestionDto.correctOption !== undefined) {
        if (updateQuestionDto.correctOption >= updateQuestionDto.options.length) {
          throw new ConflictException('Correct option index must be less than options length');
        }
      }

      const question = await this.prisma.question.update({
        where: { id },
        data: updateQuestionDto,
        include: {
          topic: true,
        },
      });
      return question;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      // Проверяем, используется ли вопрос в тестах
      const question = await this.prisma.question.findUnique({
        where: { id },
        include: {
          tests: true,
          testResults: true,
        },
      });

      // Безопасная проверка с использованием опциональной цепочки
      if ((question?.tests?.length ?? 0) > 0 || (question?.testResults?.length ?? 0) > 0) {
        throw new ConflictException('Cannot delete question that is used in tests');
      }

      await this.prisma.question.delete({
        where: { id },
      });
      return { message: 'Question deleted successfully' };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
  }

  async checkAnswer(id: string, selectedOption: number) {
    const question = await this.findOne(id);
    
    const isCorrect = question.correctOption === selectedOption;
    
    return {
      isCorrect,
      correctOption: question.correctOption,
      explanation: question.explanation,
    };
  }
}