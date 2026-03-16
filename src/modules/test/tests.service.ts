import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

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
      },
    });
  }

  async findOne(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    return test;
  }
}