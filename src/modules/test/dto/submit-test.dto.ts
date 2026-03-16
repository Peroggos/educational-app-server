import { IsArray, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsUUID()
  questionId: string;

  @IsNumber()
  selectedOption: number;
}

export class SubmitTestDto {
  @IsUUID()
  testId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}