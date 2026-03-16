import { Difficulty } from '@prisma/client';

export class QuestionEntity {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string | null;
  difficulty: Difficulty;
  topicId: string;
  createdAt: Date;
  updatedAt: Date;
}