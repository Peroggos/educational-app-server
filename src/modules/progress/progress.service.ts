import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getUserProgress(userId: string) {
    const progress = await this.prisma.userProgress.findMany({
      where: { userId },
      include: {
        topic: {
          include: {
            subject: true,
            _count: {
              select: { questions: true },
            },
          },
        },
      },
      orderBy: {
        lastPracticed: 'desc',
      },
    });

    return progress.map(p => ({
      ...p,
      successRate: p.questionsAnswered > 0 
        ? Math.round((p.correctAnswers / p.questionsAnswered) * 100) 
        : 0,
      totalQuestions: p.topic._count.questions,
      remainingQuestions: p.topic._count.questions - p.questionsAnswered,
    }));
  }

  async getTopicProgress(userId: string, topicId: string) {
    const progress = await this.prisma.userProgress.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      include: {
        topic: {
          include: {
            subject: true,
            questions: {
              select: {
                id: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    if (!progress) {
      return {
        userId,
        topicId,
        questionsAnswered: 0,
        correctAnswers: 0,
        successRate: 0,
        lastPracticed: null,
        totalQuestions: 0,
        remainingQuestions: 0,
      };
    }

    const totalQuestions = progress.topic.questions.length;
    
    return {
      ...progress,
      successRate: progress.questionsAnswered > 0 
        ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100) 
        : 0,
      totalQuestions,
      remainingQuestions: totalQuestions - progress.questionsAnswered,
    };
  }

  async getSubjectProgress(userId: string, subjectId: string) {
    const topics = await this.prisma.topic.findMany({
      where: { subjectId },
      include: {
        userProgress: {
          where: { userId },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    const progress = topics.map(topic => ({
      topicId: topic.id,
      topicName: topic.name,
      totalQuestions: topic._count.questions,
      questionsAnswered: topic.userProgress[0]?.questionsAnswered || 0,
      correctAnswers: topic.userProgress[0]?.correctAnswers || 0,
      successRate: topic.userProgress[0]?.questionsAnswered > 0
        ? Math.round((topic.userProgress[0].correctAnswers / topic.userProgress[0].questionsAnswered) * 100)
        : 0,
      lastPracticed: topic.userProgress[0]?.lastPracticed || null,
    }));

    const totalAnswered = progress.reduce((sum, p) => sum + p.questionsAnswered, 0);
    const totalCorrect = progress.reduce((sum, p) => sum + p.correctAnswers, 0);
    const totalQuestions = progress.reduce((sum, p) => sum + p.totalQuestions, 0);

    return {
      subjectId,
      topics: progress,
      summary: {
        totalQuestions,
        totalAnswered,
        totalCorrect,
        overallSuccessRate: totalAnswered > 0
          ? Math.round((totalCorrect / totalAnswered) * 100)
          : 0,
        completionRate: totalQuestions > 0
          ? Math.round((totalAnswered / totalQuestions) * 100)
          : 0,
      },
    };
  }

  async updateProgress(userId: string, updateProgressDto: UpdateProgressDto) {
    const { topicId, questionsAnswered, correctAnswers } = updateProgressDto;

    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    const progress = await this.prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: {
        questionsAnswered: {
          increment: questionsAnswered || 0,
        },
        correctAnswers: {
          increment: correctAnswers || 0,
        },
        lastPracticed: new Date(),
      },
      create: {
        userId,
        topicId,
        questionsAnswered: questionsAnswered || 0,
        correctAnswers: correctAnswers || 0,
      },
    });

    return progress;
  }

  async getUserStats(userId: string) {
    const [
      totalProgress,
      testResults,
      userProgress,
      achievements
    ] = await Promise.all([
      this.prisma.userProgress.aggregate({
        where: { userId },
        _sum: {
          questionsAnswered: true,
          correctAnswers: true,
        },
        _avg: {
          correctAnswers: true,
        },
      }),
      this.prisma.testResult.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          test: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.userProgress.count({
        where: { userId },
      }),
      this.prisma.userAchievement.count({
        where: { userId },
      }),
    ]);

    const totalAnswered = totalProgress._sum.questionsAnswered || 0;
    const totalCorrect = totalProgress._sum.correctAnswers || 0;

    return {
      totalQuestionsAnswered: totalAnswered,
      totalCorrectAnswers: totalCorrect,
      overallSuccessRate: totalAnswered > 0 
        ? Math.round((totalCorrect / totalAnswered) * 100) 
        : 0,
      topicsPracticed: userProgress,
      achievements: achievements,
      averageScore: Math.round(totalProgress._avg.correctAnswers || 0),
      recentTests: testResults.map(test => ({
        id: test.id,
        testId: test.testId,
        testName: test.test.name,
        score: test.score,
        completedAt: test.completedAt,
      })),
    };
  }

  async getAchievements(userId: string) {
    const [allAchievements, userAchievements] = await Promise.all([
      this.prisma.achievement.findMany({
        orderBy: {
          threshold: 'asc',
        },
      }),
      this.prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true,
        },
      }),
    ]);

    const userStats = await this.getUserStats(userId);
    const unlockedIds = userAchievements.map(ua => ua.achievementId);

    return allAchievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.includes(achievement.id),
      progress: Math.min(
        Math.round((userStats.totalQuestionsAnswered / achievement.threshold) * 100),
        100
      ),
      current: userStats.totalQuestionsAnswered,
      target: achievement.threshold,
    }));
  }

  async checkAndUnlockAchievements(userId: string) {
    const userStats = await this.getUserStats(userId);
    const achievements = await this.prisma.achievement.findMany();

    for (const achievement of achievements) {
      let achieved = false;

      switch (achievement.condition) {
        case 'questions_answered':
          achieved = userStats.totalQuestionsAnswered >= achievement.threshold;
          break;
        case 'success_rate':
          achieved = userStats.overallSuccessRate >= achievement.threshold;
          break;
        case 'tests_completed':
          achieved = userStats.recentTests.length >= achievement.threshold;
          break;
        case 'topics_practiced':
          achieved = userStats.topicsPracticed >= achievement.threshold;
          break;
      }

      if (achieved) {
        try {
          await this.prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
            },
          });
        } catch (error) {
          // Achievement already unlocked
        }
      }
    }
  }
}