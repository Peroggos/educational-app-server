export class TestResultEntity {
  id: string;
  userId: string;
  testId: string;
  score: number;
  totalQuestions: number;
  answers: any;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
}