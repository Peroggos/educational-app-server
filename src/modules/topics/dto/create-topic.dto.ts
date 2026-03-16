import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsUUID()
  subjectId: string;
}