import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { TopicsModule } from './modules/topics/topics.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { TestsModule } from './modules/test/tests.module';
import { ProgressModule } from './modules/progress/progress.module';
import { LessonsModule } from './modules/lessons/lessons.module'; // Добавить
import { PrismaModule } from './modules/prisma/prisma.module';
import appConfig from './modules/config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SubjectsModule,
    TopicsModule,
    QuestionsModule,
    TestsModule,
    ProgressModule,
    LessonsModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}