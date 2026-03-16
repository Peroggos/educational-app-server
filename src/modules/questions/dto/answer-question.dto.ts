import { IsNumber, Min, Max } from 'class-validator';

export class AnswerQuestionDto {
  @IsNumber()
  @Min(0)
  selectedOption: number;
}