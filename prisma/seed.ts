// prisma/seed.ts
import { PrismaClient, Role, Difficulty, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // 1. Очистка существующих данных (в правильном порядке)
  console.log('🧹 Очистка базы данных...');
  await prisma.testResult.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.test.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // Хеширование паролей
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. СОЗДАНИЕ ПОЛЬЗОВАТЕЛЕЙ
  console.log('👥 Создание пользователей...');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@school-trainer.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: Role.ADMIN,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@school-trainer.com',
      password: hashedPassword,
      firstName: 'Мария',
      lastName: 'Петрова',
      role: Role.TEACHER,
    },
  });

  // Явно указываем тип массива
  const students: User[] = [];
  const studentNames = [
    { firstName: 'Иван', lastName: 'Иванов' },
    { firstName: 'Анна', lastName: 'Смирнова' },
    { firstName: 'Петр', lastName: 'Сидоров' },
    { firstName: 'Елена', lastName: 'Козлова' },
  ];

  for (let i = 0; i < studentNames.length; i++) {
    const student = await prisma.user.create({
      data: {
        email: `student${i + 1}@school-trainer.com`,
        password: hashedPassword,
        firstName: studentNames[i].firstName,
        lastName: studentNames[i].lastName,
        role: Role.STUDENT,
      },
    });
    students.push(student);
  }

  console.log(`✅ Создано: 1 админ, 1 учитель, ${students.length} учеников`);

  // 3. СОЗДАНИЕ ПРЕДМЕТОВ
  console.log('📚 Создание предметов...');
  
  const math = await prisma.subject.create({
    data: {
      name: 'Математика',
      description: 'Наука о числах, формулах и математических операциях.',
    },
  });

  const russian = await prisma.subject.create({
    data: {
      name: 'Русский язык',
      description: 'Правила орфографии, пунктуации и грамматики.',
    },
  });

  const physics = await prisma.subject.create({
    data: {
      name: 'Физика',
      description: 'Законы природы, механические и электрические явления.',
    },
  });

  // 4. СОЗДАНИЕ ТЕМ
  console.log('📖 Создание тем...');

  const mathArithmetic = await prisma.topic.create({
    data: {
      name: 'Арифметика',
      description: 'Сложение, вычитание, умножение, деление.',
      subjectId: math.id,
    },
  });

  const mathFractions = await prisma.topic.create({
    data: {
      name: 'Дроби',
      description: 'Обыкновенные и десятичные дроби.',
      subjectId: math.id,
    },
  });

  const mathEquations = await prisma.topic.create({
    data: {
      name: 'Уравнения',
      description: 'Линейные и квадратные уравнения.',
      subjectId: math.id,
    },
  });

  const russianOrthography = await prisma.topic.create({
    data: {
      name: 'Орфография',
      description: 'Правила написания слов.',
      subjectId: russian.id,
    },
  });

  const russianGrammar = await prisma.topic.create({
    data: {
      name: 'Грамматика',
      description: 'Части речи и члены предложения.',
      subjectId: russian.id,
    },
  });

  const physicsMechanics = await prisma.topic.create({
    data: {
      name: 'Механика',
      description: 'Движение, силы, законы Ньютона.',
      subjectId: physics.id,
    },
  });

  // 5. СОЗДАНИЕ ВОПРОСОВ
  console.log('❓ Создание вопросов...');

  const q1 = await prisma.question.create({
    data: {
      text: 'Сколько будет 15 + 27?',
      options: ['32', '42', '52', '62'],
      correctOption: 1,
      explanation: '15 + 27 = 42',
      difficulty: Difficulty.EASY,
      topicId: mathArithmetic.id,
    },
  });

  const q2 = await prisma.question.create({
    data: {
      text: 'Результат умножения 12 × 8:',
      options: ['86', '96', '106', '116'],
      correctOption: 1,
      explanation: '12 × 8 = 96',
      difficulty: Difficulty.EASY,
      topicId: mathArithmetic.id,
    },
  });

  const q3 = await prisma.question.create({
    data: {
      text: 'Какая дробь равна 0.75?',
      options: ['3/4', '2/3', '5/6', '4/5'],
      correctOption: 0,
      explanation: '0.75 = 75/100 = 3/4',
      difficulty: Difficulty.MEDIUM,
      topicId: mathFractions.id,
    },
  });

  const q4 = await prisma.question.create({
    data: {
      text: 'Сложите дроби: 1/3 + 1/6',
      options: ['1/2', '2/9', '1/4', '1/3'],
      correctOption: 0,
      explanation: '1/3 = 2/6, 2/6 + 1/6 = 3/6 = 1/2',
      difficulty: Difficulty.MEDIUM,
      topicId: mathFractions.id,
    },
  });

  const q5 = await prisma.question.create({
    data: {
      text: 'Решите уравнение: x + 5 = 12',
      options: ['6', '7', '8', '9'],
      correctOption: 1,
      explanation: 'x = 12 - 5 = 7',
      difficulty: Difficulty.EASY,
      topicId: mathEquations.id,
    },
  });

  const q6 = await prisma.question.create({
    data: {
      text: 'В каком слове пишется буква "И"?',
      options: ['ц_рк', 'ц_ган', 'ц_плёнок', 'ц_ц'],
      correctOption: 0,
      explanation: 'В корне после Ц пишется И, кроме слов-исключений: цыган, цыплёнок, цыц',
      difficulty: Difficulty.MEDIUM,
      topicId: russianOrthography.id,
    },
  });

  const q7 = await prisma.question.create({
    data: {
      text: 'Определите тип предложения: "Наступила осень"',
      options: ['простое', 'сложное', 'сложносочиненное', 'сложноподчиненное'],
      correctOption: 0,
      explanation: 'Одна грамматическая основа - простое предложение',
      difficulty: Difficulty.EASY,
      topicId: russianGrammar.id,
    },
  });

  const q8 = await prisma.question.create({
    data: {
      text: 'Какой закон физики описывается формулой F = ma?',
      options: ['Закон инерции', 'Второй закон Ньютона', 'Закон сохранения энергии', 'Закон всемирного тяготения'],
      correctOption: 1,
      explanation: 'F = ma - это второй закон Ньютона (сила равна массе, умноженной на ускорение)',
      difficulty: Difficulty.MEDIUM,
      topicId: physicsMechanics.id,
    },
  });

  // 6. СОЗДАНИЕ ТЕСТОВ
  console.log('📝 Создание тестов...');

  const mathTest = await prisma.test.create({
    data: {
      name: 'Основы математики',
      description: 'Проверьте знание арифметики и дробей.',
      questions: {
        connect: [
          { id: q1.id },
          { id: q2.id },
          { id: q3.id },
          { id: q4.id },
          { id: q5.id },
        ],
      },
    },
  });

  const russianTest = await prisma.test.create({
    data: {
      name: 'Русский язык: орфография и грамматика',
      description: 'Проверьте свою грамотность.',
      questions: {
        connect: [
          { id: q6.id },
          { id: q7.id },
        ],
      },
    },
  });

  const physicsTest = await prisma.test.create({
    data: {
      name: 'Основы механики',
      description: 'Проверьте знание законов физики.',
      questions: {
        connect: [{ id: q8.id }],
      },
    },
  });

  // 7. СОЗДАНИЕ РЕЗУЛЬТАТОВ ТЕСТОВ
  console.log('📊 Создание результатов тестов...');

  if (students.length > 0) {
    await prisma.testResult.create({
      data: {
        userId: students[0].id,
        testId: mathTest.id,
        score: 4,
        totalQuestions: 5,
        answers: [1, 1, 0, 0, 1],
        startedAt: new Date(Date.now() - 30 * 60000),
        completedAt: new Date(),
      },
    });

    await prisma.testResult.create({
      data: {
        userId: students[0].id,
        testId: russianTest.id,
        score: 2,
        totalQuestions: 2,
        answers: [0, 0],
        startedAt: new Date(Date.now() - 2 * 60 * 60000),
        completedAt: new Date(Date.now() - 2 * 60 * 60000 + 15 * 60000),
      },
    });

    if (students.length > 1) {
      await prisma.testResult.create({
        data: {
          userId: students[1].id,
          testId: mathTest.id,
          score: 3,
          totalQuestions: 5,
          answers: [1, 0, 0, 1, 1],
          startedAt: new Date(Date.now() - 1 * 60 * 60000),
          completedAt: new Date(),
        },
      });
    }
  }

  // 8. СОЗДАНИЕ ПРОГРЕССА ПОЛЬЗОВАТЕЛЕЙ
  console.log('📈 Создание прогресса пользователей...');

  if (students.length > 0) {
    await prisma.userProgress.create({
      data: {
        userId: students[0].id,
        topicId: mathArithmetic.id,
        questionsAnswered: 10,
        correctAnswers: 8,
        lastPracticed: new Date(),
      },
    });

    await prisma.userProgress.create({
      data: {
        userId: students[0].id,
        topicId: mathFractions.id,
        questionsAnswered: 7,
        correctAnswers: 5,
        lastPracticed: new Date(),
      },
    });

    await prisma.userProgress.create({
      data: {
        userId: students[0].id,
        topicId: russianOrthography.id,
        questionsAnswered: 5,
        correctAnswers: 4,
        lastPracticed: new Date(),
      },
    });

    if (students.length > 1) {
      await prisma.userProgress.create({
        data: {
          userId: students[1].id,
          topicId: mathArithmetic.id,
          questionsAnswered: 8,
          correctAnswers: 6,
          lastPracticed: new Date(),
        },
      });

      await prisma.userProgress.create({
        data: {
          userId: students[1].id,
          topicId: physicsMechanics.id,
          questionsAnswered: 3,
          correctAnswers: 2,
          lastPracticed: new Date(),
        },
      });
    }
  }

  // 9. ВЫВОД ИТОГОВ
  console.log('\n✅ Заполнение базы данных завершено!');
  console.log('\n📊 СТАТИСТИКА:');
  console.log(`👥 Пользователей: ${await prisma.user.count()}`);
  console.log(`📚 Предметов: ${await prisma.subject.count()}`);
  console.log(`📖 Тем: ${await prisma.topic.count()}`);
  console.log(`❓ Вопросов: ${await prisma.question.count()}`);
  console.log(`📝 Тестов: ${await prisma.test.count()}`);
  console.log(`📊 Результатов тестов: ${await prisma.testResult.count()}`);
  console.log(`📈 Прогресс: ${await prisma.userProgress.count()}`);

  console.log('\n🔐 ТЕСТОВЫЕ УЧЕТНЫЕ ДАННЫЕ:');
  console.log('👑 Админ: admin@school-trainer.com / password123');
  console.log('👨‍🏫 Учитель: teacher@school-trainer.com / password123');
  console.log('👨‍🎓 Ученик 1: student1@school-trainer.com / password123');
  console.log('👩‍🎓 Ученик 2: student2@school-trainer.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });