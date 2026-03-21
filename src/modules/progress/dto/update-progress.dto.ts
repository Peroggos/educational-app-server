import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateProgressDto {
  @IsUUID()
  topicId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  questionsAnswered?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  correctAnswers?: number;
}