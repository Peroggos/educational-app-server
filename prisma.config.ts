import { defineConfig } from '@prisma/config'
import 'dotenv/config'

// Проверяем наличие переменных окружения
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in .env file')
}

const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: databaseUrl,  // Теперь точно string, не undefined
    ...(shadowDatabaseUrl && { shadowDatabaseUrl }), // Добавляем только если есть
  },
})