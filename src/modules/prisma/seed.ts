import { PrismaClient, Role, Difficulty } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Очистка базы данных
  await prisma.$transaction([
    prisma.testResult.deleteMany(),
    prisma.userProgress.deleteMany(),
    prisma.question.deleteMany(),
    prisma.topic.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.test.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Создание пользователей
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.TEACHER,
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: Role.STUDENT,
    },
  });

  // Создание предметов
  const mathematics = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      description: 'Study of numbers, quantities, and shapes',
    },
  });

  const physics = await prisma.subject.create({
    data: {
      name: 'Physics',
      description: 'Study of matter, energy, and their interactions',
    },
  });

  // Создание тем
  const algebra = await prisma.topic.create({
    data: {
      name: 'Algebra',
      description: 'Study of mathematical symbols and rules',
      subjectId: mathematics.id,
    },
  });

  const geometry = await prisma.topic.create({
    data: {
      name: 'Geometry',
      description: 'Study of shapes, sizes, and properties of space',
      subjectId: mathematics.id,
    },
  });

  const mechanics = await prisma.topic.create({
    data: {
      name: 'Mechanics',
      description: 'Study of motion and forces',
      subjectId: physics.id,
    },
  });

  // Создание вопросов
  await prisma.question.createMany({
    data: [
      {
        text: 'What is the value of x in the equation 2x + 5 = 13?',
        options: ['4', '5', '6', '7'],
        correctOption: 0,
        explanation: '2x + 5 = 13 → 2x = 8 → x = 4',
        difficulty: Difficulty.EASY,
        topicId: algebra.id,
      },
      {
        text: 'What is the area of a circle with radius 5?',
        options: ['25π', '10π', '5π', '20π'],
        correctOption: 0,
        explanation: 'Area = πr² = π(5)² = 25π',
        difficulty: Difficulty.MEDIUM,
        topicId: geometry.id,
      },
      {
        text: 'What is Newton\'s First Law of Motion?',
        options: [
          'F = ma',
          'Every action has an equal and opposite reaction',
          'An object at rest stays at rest unless acted upon',
          'Energy cannot be created or destroyed'
        ],
        correctOption: 2,
        explanation: 'Newton\'s First Law is the law of inertia',
        difficulty: Difficulty.EASY,
        topicId: mechanics.id,
      },
    ],
  });

  // Создание теста
  const test = await prisma.test.create({
    data: {
      name: 'Mathematics Basics',
      description: 'Test your basic mathematics knowledge',
      timeLimit: 30,
    },
  });

  // Создание прогресса пользователя
  await prisma.userProgress.create({
    data: {
      userId: student.id,
      topicId: algebra.id,
      questionsAnswered: 10,
      correctAnswers: 8,
    },
  });

  console.log('Database seeded successfully!');
  console.log({ admin, teacher, student });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });