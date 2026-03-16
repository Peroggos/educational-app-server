import { IsUUID } from 'class-validator';

export class StartTestDto {
  @IsUUID()
  testId: string;
}