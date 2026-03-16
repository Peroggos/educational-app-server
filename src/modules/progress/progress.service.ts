import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getUserProgress(userId: string) {
    return this.prisma.userProgress.findMany({
      where: { userId },
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
    });
  }
}