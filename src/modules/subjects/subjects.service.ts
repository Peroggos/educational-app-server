import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    try {
      const subject = await this.prisma.subject.create({
        data: createSubjectDto,
        include: {
          topics: true,
        },
      });
      return subject;
    } catch {
      throw new ConflictException('Subject with this name already exists');
    }
  }

  async findAll() {
    return this.prisma.subject.findMany({
      include: {
        topics: {
          include: {
            _count: {
              select: { questions: true },
            },
          },
        },
        _count: {
          select: { topics: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        topics: {
          include: {
            questions: {
              select: {
                id: true,
                text: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    try {
      const subject = await this.prisma.subject.update({
        where: { id },
        data: updateSubjectDto,
        include: {
          topics: true,
        },
      });
      return subject;
    } catch {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.subject.delete({
        where: { id },
      });
      return { message: 'Subject deleted successfully' };
    } catch {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
  }
}