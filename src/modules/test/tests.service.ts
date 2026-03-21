import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { SubmitTestDto } from './dto/submit-test.dto';
import {  Prisma  } from '@prisma/client'
@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async create(createTestDto: CreateTestDto) {
    // Проверяем существование всех вопросов
    const questions = await this.prisma.question.findMany({
      where: {
        id: {
          in: createTestDto.questionIds,
        },
      },
    });

    if (questions.length !== createTestDto.questionIds.length) {
      throw new NotFoundException('One or more questions not found');
    }

    const test = await this.prisma.test.create({
      data: {
        name: createTestDto.name,
        description: createTestDto.description,
        timeLimit: createTestDto.timeLimit,
        // Убрано passingScore
        questions: {
          connect: createTestDto.questionIds.map(id => ({ id })),
        },
      },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            difficulty: true,
          },
        },
      },
    });

    return test;
  }

  async findAll() {
    return this.prisma.test.findMany({
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            difficulty: true,
          },
        },
        _count: {
          select: { results: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            difficulty: true,
            topic: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    return test;
  }

  async findByTopic(topicId: string) {
    return this.prisma.test.findMany({
      where: {
        questions: {
          some: {
            topicId: topicId,
          },
        },
      },
      include: {
        questions: {
          select: {
            id: true,
            difficulty: true,
          },
        },
        _count: {
          select: { results: true },
        },
      },
    });
  }

  async update(id: string, updateTestDto: UpdateTestDto) {
    try {
      // Если обновляем вопросы, проверяем их существование
      if (updateTestDto.questionIds) {
        const questions = await this.prisma.question.findMany({
          where: {
            id: {
              in: updateTestDto.questionIds,
            },
          },
        });

        if (questions.length !== updateTestDto.questionIds.length) {
          throw new NotFoundException('One or more questions not found');
        }
      }

      // Создаем объект с данными для обновления, исключая undefined поля
      const updateData: any = {};
      if (updateTestDto.name !== undefined) updateData.name = updateTestDto.name;
      if (updateTestDto.description !== undefined) updateData.description = updateTestDto.description;
      if (updateTestDto.timeLimit !== undefined) updateData.timeLimit = updateTestDto.timeLimit;
      // Убрано passingScore
      if (updateTestDto.questionIds) {
        updateData.questions = {
          set: updateTestDto.questionIds.map(id => ({ id })),
        };
      }

      const test = await this.prisma.test.update({
        where: { id },
        data: updateData,
        include: {
          questions: true,
        },
      });
      return test;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      // Проверяем, есть ли результаты теста
      const test = await this.prisma.test.findUnique({
        where: { id },
        include: {
          _count: {
            select: { results: true },
          },
        },
      });

      if (test?._count?.results && test._count.results > 0) {
        throw new ConflictException('Cannot delete test with existing results');
      }

      await this.prisma.test.delete({
        where: { id },
      });
      return { message: 'Test deleted successfully' };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
  }

// src/modules/test/tests.service.ts
async startTest(userId: string, testId: string) {
  const test = await this.findOne(testId);

  // Проверяем, нет ли уже незавершенного теста
  const existingResult = await this.prisma.testResult.findFirst({
    where: {
      userId,
      testId,
      completedAt: null,
    },
    include: {
      test: {
        include: {
          questions: {
            select: {
              id: true,
              text: true,
              options: true,
              difficulty: true,
              explanation: true,
              topic: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (existingResult) {
    // Если есть незавершенный тест, возвращаем его с вопросами
    return {
      session: existingResult,
      questions: existingResult.test.questions,
      test: {
        id: existingResult.test.id,
        name: existingResult.test.name,
        description: existingResult.test.description,
        timeLimit: existingResult.test.timeLimit,
      },
    };
  }

  // Создаем новую сессию
  const testResult = await this.prisma.testResult.create({
    data: {
      userId,
      testId,
      score: 0,
      totalQuestions: test.questions.length,
      answers: [],
      startedAt: new Date(),
    },
    include: {
      test: {
        include: {
          questions: {
            select: {
              id: true,
              text: true,
              options: true,
              difficulty: true,
              explanation: true,
              topic: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Возвращаем сессию с вопросами
  return {
    session: testResult,
    questions: testResult.test.questions,
    test: {
      id: testResult.test.id,
      name: testResult.test.name,
      description: testResult.test.description,
      timeLimit: testResult.test.timeLimit,
    },
  };
}

  async submitTest(userId: string, submitTestDto: SubmitTestDto) {
    const testResult = await this.prisma.testResult.findFirst({
      where: {
        userId,
        testId: submitTestDto.testId,
        completedAt: null,
      },
      include: {
        test: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!testResult) {
      throw new NotFoundException('Active test session not found');
    }

    // Проверяем время
    if (testResult.test.timeLimit) {
      const timeLimitMs = testResult.test.timeLimit * 60 * 1000;
      const elapsedTime = Date.now() - new Date(testResult.startedAt).getTime();
      if (elapsedTime > timeLimitMs) {
        throw new BadRequestException('Test time limit exceeded');
      }
    }

    // Подсчитываем результаты
    let correctAnswers = 0;
    const answers: Array<{ questionId: string; selectedOption: number; isCorrect: boolean }> = [];

    for (const answer of submitTestDto.answers) {
      const question = testResult.test.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      const isCorrect = question.correctOption === answer.selectedOption;
      if (isCorrect) correctAnswers++;

      answers.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
      });
    }

    const score = Math.round((correctAnswers / testResult.totalQuestions) * 100);

    // Используем правильный тип для answers (JSON)
    const updatedResult = await this.prisma.testResult.update({
      where: { id: testResult.id },
      data: {
        score,
        // correctAnswers убрано
        answers: JSON.stringify(answers), // Приводим к any для JSON поля
        completedAt: new Date(),
      },
      include: {
        test: true,
      },
    });

    // Обновляем прогресс пользователя
    await this.updateUserProgress(userId, answers);

    return updatedResult;
  }

  private async updateUserProgress(userId: string, answers: any[]) {
    for (const answer of answers) {
      const question = await this.prisma.question.findUnique({
        where: { id: answer.questionId },
        include: { topic: true },
      });

      if (!question) continue;

      await this.prisma.userProgress.upsert({
        where: {
          userId_topicId: {
            userId,
            topicId: question.topicId,
          },
        },
        update: {
          questionsAnswered: { increment: 1 },
          correctAnswers: { increment: answer.isCorrect ? 1 : 0 },
          lastPracticed: new Date(),
        },
        create: {
          userId,
          topicId: question.topicId,
          questionsAnswered: 1,
          correctAnswers: answer.isCorrect ? 1 : 0,
        },
      });
    }
  }

  async getUserResults(userId: string) {
    return this.prisma.testResult.findMany({
      where: { userId },
      include: {
        test: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTestResults(testId: string) {
    return this.prisma.testResult.findMany({
      where: { testId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        score: 'desc',
      },
    });
  }

  async getLeaderboard(limit: number = 10) {
    const results = await this.prisma.testResult.groupBy({
      by: ['userId'],
      _avg: {
        score: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _avg: {
          score: 'desc',
        },
      },
      take: limit,
    });

    const leaderboard = await Promise.all(
      results.map(async (result) => {
        const user = await this.prisma.user.findUnique({
          where: { id: result.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        });
        return {
          user,
          averageScore: Math.round(result._avg.score || 0),
          testsTaken: result._count.id,
        };
      })
    );

    return leaderboard;
  }
}