import { IsString, IsArray, IsNumber, IsEnum, IsUUID, IsOptional, Min, Max, ArrayMinSize } from 'class-validator';

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsArray()
  @ArrayMinSize(2)
  options: string[];

  @IsNumber()
  @Min(0)
  correctOption: number;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsUUID()
  topicId: string;
}
