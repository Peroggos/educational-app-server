export class TopicEntity {
  id: string;
  name: string;
  description: string | null;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
}