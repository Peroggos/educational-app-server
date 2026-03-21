import { IsArray, IsUUID, IsNumber, ValidateNested, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsString()
  questionId: string;

  @IsNumber()
  @Min(0)
  selectedOption: number;
}

export class SubmitTestDto {
 @IsString()
  testId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}