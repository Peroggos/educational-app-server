export class LessonEntity {
  id: string;
  title: string;
  description: string | null;
  content: string;
  order: number;
  topicId: string;
  videoUrl: string | null;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
}