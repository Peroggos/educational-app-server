export class TestResultEntity {
  id: string;
  userId: string;
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: any;
  startedAt: Date;
  completedAt: Date | null;
  timeSpent?: number;
  createdAt: Date;
}