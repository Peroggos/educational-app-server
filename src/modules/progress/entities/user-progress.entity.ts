export class UserProgressEntity {
  id: string;
  userId: string;
  topicId: string;
  questionsAnswered: number;
  correctAnswers: number;
  lastPracticed: Date;
  createdAt: Date;
  updatedAt: Date;
}