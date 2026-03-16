import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TestsService } from './tests.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('tests')
@UseGuards(JwtAuthGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  findAll() {
    return this.testsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testsService.findOne(id);
  }
}