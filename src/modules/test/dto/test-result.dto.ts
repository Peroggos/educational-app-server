export class TestResultDto {
  id: string;
  testId: string;
  testName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent?: number;
  completedAt: Date;
}