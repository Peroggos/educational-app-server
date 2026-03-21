import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  getUserProgress(@CurrentUser() user) {
    return this.progressService.getUserProgress(user.id);
  }

  @Get('stats')
  getUserStats(@CurrentUser() user) {
    return this.progressService.getUserStats(user.id);
  }

  @Get('achievements')
  getAchievements(@CurrentUser() user) {
    return this.progressService.getAchievements(user.id);
  }

  @Get('subject/:subjectId')
  getSubjectProgress(
    @CurrentUser() user,
    @Param('subjectId') subjectId: string,
  ) {
    return this.progressService.getSubjectProgress(user.id, subjectId);
  }

  @Get('topic/:topicId')
  getTopicProgress(
    @CurrentUser() user,
    @Param('topicId') topicId: string,
  ) {
    return this.progressService.getTopicProgress(user.id, topicId);
  }

  @Post('update')
  updateProgress(
    @CurrentUser() user,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.progressService.updateProgress(user.id, updateProgressDto);
  }

  @Post('check-achievements')
  checkAchievements(@CurrentUser() user) {
    return this.progressService.checkAndUnlockAchievements(user.id);
  }
}