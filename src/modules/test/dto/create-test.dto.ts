import { IsString, IsOptional, IsNumber, IsArray, IsUUID, Min, Max } from 'class-validator';

export class CreateTestDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(180)
  timeLimit?: number;

  @IsArray()
 // @IsUUID('4', { each: true })
  questionIds: string[];
}