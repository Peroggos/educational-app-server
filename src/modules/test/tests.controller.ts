// src/modules/test/tests.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { StartTestDto } from './dto/start-test.dto';
import { SubmitTestDto } from './dto/submit-test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Body() createTestDto: CreateTestDto) {
    return this.testsService.create(createTestDto);
  }

  @Get()
  findAll() {
    return this.testsService.findAll();
  }

  @Get('my-results')
  getMyResults(@CurrentUser() user) {
    return this.testsService.getUserResults(user.id);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.testsService.getLeaderboard(limit ? parseInt(limit) : 10);
  }

  @Get('topic/:topicId')
  findByTopic(@Param('topicId') topicId: string) {
    return this.testsService.findByTopic(topicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testsService.findOne(id);
  }

  @Get(':id/results')
  @Roles(Role.ADMIN, Role.TEACHER)
  getTestResults(@Param('id') id: string) {
    return this.testsService.getTestResults(id);
  }

  //  ДОБАВЛЯЕМ ЭНДПОИНТ ДЛЯ НАЧАЛА ТЕСТА
  @Post(':id/start')
  startTest(
    @CurrentUser() user,
    @Param('id') testId: string,
  ) {
    return this.testsService.startTest(user.id, testId);
  }

  // Альтернативный вариант через тело запроса
  @Post('start')
  startTestWithBody(
    @CurrentUser() user,
    @Body() startTestDto: StartTestDto,
  ) {
    return this.testsService.startTest(user.id, startTestDto.testId);
  }

  @Post('submit')
  submitTest(@CurrentUser() user, @Body() submitTestDto: SubmitTestDto) {
    return this.testsService.submitTest(user.id, submitTestDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testsService.update(id, updateTestDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.testsService.remove(id);
  }
}