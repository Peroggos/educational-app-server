#  **Документация API Образовательной Платформы**

##  **Общая информация**

### **Базовый URL**
```
http://localhost:3000/api
```

### **Аутентификация**
Большинство эндпоинтов требуют JWT токен. Токен передается в заголовке:
```
Authorization: Bearer <your_jwt_token>
```

### **Формат ответов**
Все успешные ответы обернуты в объект:
```json
{
  "data": { ... },
  "timestamp": "2026-03-24T10:00:00.000Z",
  "path": "/api/endpoint"
}
```

Ошибки возвращаются в формате:
```json
{
  "statusCode": 400,
  "timestamp": "2026-03-24T10:00:00.000Z",
  "path": "/api/endpoint",
  "message": "Описание ошибки"
}
```

### **Роли пользователей**
- `STUDENT` - студент (базовые права)
- `TEACHER` - учитель (создание контента)
- `ADMIN` - администратор (полный доступ)

---

## **Аутентификация (Auth)**

### **Регистрация**
```http
POST /auth/register
```

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Имя",
  "lastName": "Фамилия",
  "role": "STUDENT"  // STUDENT, TEACHER, ADMIN
}
```

**Успешный ответ (201):**
```json
{
  "data": {
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "firstName": "Имя",
      "lastName": "Фамилия",
      "role": "STUDENT",
      "createdAt": "2026-03-24T10:00:00.000Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### **Вход**
```http
POST /auth/login
```

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Успешный ответ (201):**
```json
{
  "data": {
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "firstName": "Имя",
      "lastName": "Фамилия",
      "role": "STUDENT"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---
## **Пользователи (Users)**

### **Мой профиль**
```http
GET /users/profile
```
**Требует авторизацию**

**Успешный ответ (200):**
```json
{
  "data": {
    "id": "cuid...",
    "email": "user@example.com",
    "firstName": "Имя",
    "lastName": "Фамилия",
    "role": "STUDENT",
    "createdAt": "2026-03-24T10:00:00.000Z",
    "updatedAt": "2026-03-24T10:00:00.000Z"
  }
}
```

### **Все пользователи (только ADMIN)**
```http
GET /users
```
**Требует авторизацию**

### **Пользователь по ID (только ADMIN)**
```http
GET /users/:id
```

### **Обновить пользователя (только ADMIN)**
```http
PATCH /users/:id
```

**Тело запроса:**
```json
{
  "firstName": "Новое имя",
  "lastName": "Новая фамилия",
  "role": "TEACHER"
}
```

### **Удалить пользователя (только ADMIN)**
```http
DELETE /users/:id
```

---

##  **Предметы (Subjects)**

### **Все предметы**
```http
GET /subjects
```

### **Предмет по ID**
```http
GET /subjects/:id
```

### **Создать предмет (TEACHER/ADMIN)**
```http
POST /subjects
```

**Тело запроса:**
```json
{
  "name": "Математика",
  "description": "Изучение чисел и формул"
}
```

**Успешный ответ (201):**
```json
{
  "data": {
    "id": "cuid...",
    "name": "Математика",
    "description": "Изучение чисел и формул",
    "createdAt": "2026-03-24T10:00:00.000Z",
    "updatedAt": "2026-03-24T10:00:00.000Z"
  }
}
```

### **Обновить предмет (TEACHER/ADMIN)**
```http
PATCH /subjects/:id
```

### **Удалить предмет (ADMIN)**
```http
DELETE /subjects/:id
```

---

##  **Темы (Topics)**

### **Все темы**
```http
GET /topics?subjectId=:subjectId
```
Параметр `subjectId` опционален для фильтрации по предмету.

### **Тема по ID**
```http
GET /topics/:id
```

**Успешный ответ (200):**
```json
{
  "data": {
    "id": "cuid...",
    "name": "Алгебра",
    "description": "Уравнения и функции",
    "subjectId": "cuid...",
    "subject": {
      "id": "cuid...",
      "name": "Математика"
    },
    "questions": [...],
    "lessons": [...],
    "_count": {
      "questions": 5,
      "lessons": 3
    }
  }
}
```

### **Статистика темы**
```http
GET /topics/stats/:id
```
**Требует авторизацию (TEACHER/ADMIN)**

**Успешный ответ (200):**
```json
{
  "data": {
    "topicId": "cuid...",
    "topicName": "Алгебра",
    "subjectName": "Математика",
    "totalQuestions": 5,
    "totalLessons": 3,
    "studentsPracticed": 42,
    "totalAnswers": 210,
    "totalCorrect": 168,
    "averageSuccessRate": 80,
    "averageTestScore": 75
  }
}
```

### **Создать тему (TEACHER/ADMIN)**
```http
POST /topics
```

**Тело запроса:**
```json
{
  "name": "Алгебра",
  "description": "Уравнения и функции",
  "subjectId": "cuid..."
}
```

### **Обновить тему (TEACHER/ADMIN)**
```http
PATCH /topics/:id
```

### **Удалить тему (ADMIN)**
```http
DELETE /topics/:id
```

---

##  **Вопросы (Questions)**

### **Все вопросы**
```http
GET /questions?topicId=:topicId
```
Параметр `topicId` опционален для фильтрации по теме.

### **Вопрос по ID**
```http
GET /questions/:id
```

### **Проверить ответ**
```http
POST /questions/:id/check
```

**Тело запроса:**
```json
{
  "selectedOption": 1  // индекс выбранного варианта (0-based)
}
```

**Успешный ответ (200):**
```json
{
  "data": {
    "isCorrect": true,
    "correctOption": 1,
    "explanation": "2 + 2 = 4"
  }
}
```

### **Создать вопрос (TEACHER/ADMIN)**
```http
POST /questions
```

**Тело запроса:**
```json
{
  "text": "Сколько будет 2 + 2?",
  "options": ["3", "4", "5", "6"],
  "correctOption": 1,
  "explanation": "2 + 2 = 4",
  "difficulty": "EASY",  // EASY, MEDIUM, HARD
  "topicId": "cuid..."
}
```

### **Обновить вопрос (TEACHER/ADMIN)**
```http
PATCH /questions/:id
```

### **Удалить вопрос (ADMIN)**
```http
DELETE /questions/:id
```

---

##  **Уроки (Lessons)**

### **Все уроки**
```http
GET /lessons?topicId=:topicId
```

### **Уроки по теме**
```http
GET /lessons/topic/:topicId
```

### **Урок по ID**
```http
GET /lessons/:id
```

### **Создать урок (TEACHER/ADMIN)**
```http
POST /lessons
```

**Тело запроса:**
```json
{
  "title": "Введение в алгебру",
  "description": "Первый урок",
  "content": "Алгебра - это раздел математики...",
  "order": 1,
  "topicId": "cuid...",
  "videoUrl": "https://youtube.com/watch?v=...",
  "duration": 45
}
```

### **Обновить урок (TEACHER/ADMIN)**
```http
PATCH /lessons/:id
```

### **Изменить порядок уроков**
```http
PATCH /lessons/reorder/:topicId
```

**Тело запроса:**
```json
[
  {"id": "lesson_id_1", "order": 1},
  {"id": "lesson_id_2", "order": 2},
  {"id": "lesson_id_3", "order": 3}
]
```

### **Удалить урок (ADMIN)**
```http
DELETE /lessons/:id
```

---

##  **Тесты (Tests)**

### **Все тесты**
```http
GET /tests
```

### **Тест по ID**
```http
GET /tests/:id
```

### **Тесты по теме**
```http
GET /tests/topic/:topicId
```

### **Начать тест**
```http
POST /tests/:id/start
```
или
```http
POST /tests/start
```

**Тело запроса (для второго варианта):**
```json
{
  "testId": "cuid..."
}
```

**Успешный ответ (200):**
```json
{
  "data": {
    "session": {
      "id": "cuid...",
      "testId": "cuid...",
      "startedAt": "2026-03-24T10:00:00.000Z",
      "totalQuestions": 10
    },
    "test": {
      "id": "cuid...",
      "name": "Тест по алгебре",
      "timeLimit": 30
    },
    "questions": [...]
  }
}
```

### **Отправить ответы**
```http
POST /tests/submit
```

**Тело запроса:**
```json
{
  "testId": "cuid...",
  "answers": [
    {"questionId": "cuid_1", "selectedOption": 2},
    {"questionId": "cuid_2", "selectedOption": 0}
  ]
}
```

**Успешный ответ (200):**
```json
{
  "data": {
    "id": "cuid...",
    "score": 80,
    "totalQuestions": 10,
    "answers": [...],
    "completedAt": "2026-03-24T10:30:00.000Z"
  }
}
```

### **Мои результаты**
```http
GET /tests/my-results
```

### **Таблица лидеров**
```http
GET /tests/leaderboard?limit=10
```

### **Результаты теста (TEACHER/ADMIN)**
```http
GET /tests/:id/results
```

### **Создать тест (TEACHER/ADMIN)**
```http
POST /tests
```

**Тело запроса:**
```json
{
  "name": "Тест по алгебре",
  "description": "Проверка знаний",
  "timeLimit": 30,
  "questionIds": ["cuid_1", "cuid_2", "cuid_3"]
}
```

### **Обновить тест (TEACHER/ADMIN)**
```http
PATCH /tests/:id
```

### **Удалить тест (ADMIN)**
```http
DELETE /tests/:id
```

---

##  **Прогресс (Progress)**

### **Мой прогресс**
```http
GET /progress
```

**Успешный ответ (200):**
```json
{
  "data": [
    {
      "id": "cuid...",
      "topicId": "cuid...",
      "topic": {
        "name": "Алгебра",
        "subject": {"name": "Математика"}
      },
      "questionsAnswered": 10,
      "correctAnswers": 8,
      "successRate": 80,
      "totalQuestions": 15,
      "remainingQuestions": 5,
      "lastPracticed": "2026-03-24T10:00:00.000Z"
    }
  ]
}
```

### **Статистика**
```http
GET /progress/stats
```

**Успешный ответ (200):**
```json
{
  "data": {
    "totalQuestionsAnswered": 150,
    "totalCorrectAnswers": 120,
    "overallSuccessRate": 80,
    "topicsPracticed": 5,
    "achievements": 3,
    "averageScore": 75,
    "recentTests": [...]
  }
}
```

### **Мои достижения**
```http
GET /progress/achievements
```

**Успешный ответ (200):**
```json
{
  "data": [
    {
      "id": "cuid...",
      "name": "Начинающий",
      "description": "Ответить на 10 вопросов",
      "icon": "",
      "unlocked": true,
      "progress": 100,
      "current": 10,
      "target": 10
    }
  ]
}
```

### **Прогресс по предмету**
```http
GET /progress/subject/:subjectId
```

### **Прогресс по теме**
```http
GET /progress/topic/:topicId
```

### **Обновить прогресс**
```http
POST /progress/update
```

**Тело запроса:**
```json
{
  "topicId": "cuid...",
  "questionsAnswered": 5,
  "correctAnswers": 4
}
```

### **Проверить достижения**
```http
POST /progress/check-achievements
```

---

##  **Health Check**

### **Проверка здоровья**
```http
GET /health
```
```http
GET /api/health
```

**Успешный ответ (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-03-24T10:00:00.000Z",
  "services": {
    "api": "up",
    "database": "connected"
  }
}
```

---

##  **Коды ответов**

| Код | Описание |
|-----|----------|
| 200 | Успешно (GET, PATCH) |
| 201 | Создано (POST) |
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Не найдено |
| 409 | Конфликт (уже существует) |
| 500 | Внутренняя ошибка сервера |

---

##  **Примеры использования**

### **Полный цикл работы с контентом**

```bash
#!/bin/bash
BASE_URL="http://localhost:3000/api"

# 1. Регистрация учителя
TEACHER_TOKEN=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "password123",
    "firstName": "Иван",
    "lastName": "Петров",
    "role": "TEACHER"
  }' | jq -r '.data.access_token')

# 2. Создать предмет
SUBJECT_ID=$(curl -s -X POST "$BASE_URL/subjects" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Математика",
    "description": "Изучение чисел и формул"
  }' | jq -r '.data.id')

# 3. Создать тему
TOPIC_ID=$(curl -s -X POST "$BASE_URL/topics" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Алгебра\",
    \"description\": \"Уравнения и функции\",
    \"subjectId\": \"$SUBJECT_ID\"
  }" | jq -r '.data.id')

# 4. Создать вопрос
QUESTION_ID=$(curl -s -X POST "$BASE_URL/questions" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"Чему равно 2 + 2 × 2?\",
    \"options\": [\"4\", \"6\", \"8\", \"10\"],
    \"correctOption\": 1,
    \"difficulty\": \"MEDIUM\",
    \"topicId\": \"$TOPIC_ID\"
  }" | jq -r '.data.id')

# 5. Создать урок
LESSON_ID=$(curl -s -X POST "$BASE_URL/lessons" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Введение в алгебру\",
    \"content\": \"Алгебра - это раздел математики...\",
    \"order\": 1,
    \"topicId\": \"$TOPIC_ID\"
  }" | jq -r '.data.id')

# 6. Создать тест
TEST_ID=$(curl -s -X POST "$BASE_URL/tests" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Тест по алгебре\",
    \"timeLimit\": 30,
    \"questionIds\": [\"$QUESTION_ID\"]
  }" | jq -r '.data.id')

echo " Контент создан!"
echo "Предмет: $SUBJECT_ID"
echo "Тема: $TOPIC_ID"
echo "Вопрос: $QUESTION_ID"
echo "Урок: $LESSON_ID"
echo "Тест: $TEST_ID"
```

---
