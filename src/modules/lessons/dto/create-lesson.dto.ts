import { IsString, IsOptional, IsNumber, IsUUID, Min, Max } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  content: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  order: number;

  @IsString()
  topicId: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsNumber()
  @IsOptional()
  duration?: number; // в минутах
}