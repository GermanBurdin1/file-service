# 📁 Режимы хранения файлов в File Service

File Service поддерживает два режима хранения файлов:
- **Локальное хранение** (по умолчанию) - файлы сохраняются в папку `uploads/`
- **AWS S3** - файлы сохраняются в Amazon S3 bucket

## 🔧 Текущий режим: Локальное хранение

### Переменные окружения (.env)
```env
# Режим хранения: 'local' или 'aws'
STORAGE_MODE=local

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=file_service_db
PORT=3008
```

## 🔄 Переключение на AWS S3

### 1. Обновить .env файл
```env
# Изменить режим на AWS
STORAGE_MODE=aws

# Добавить AWS переменные
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name

# PostgreSQL остается
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=file_service_db
PORT=3008
```

### 2. Раскомментировать AWS зависимости в package.json
```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.758.0",
    "multer-s3": "^3.0.1"
  }
}
```

### 3. Установить AWS зависимости
```bash
npm install @aws-sdk/client-s3@^3.758.0 multer-s3@^3.0.1
```

### 4. Раскомментировать AWS код в file.service.ts
- Раскомментировать импорты AWS SDK
- Раскомментировать создание S3 клиента
- Раскомментировать AWS код в методе uploadFile()
- Удалить временную заглушку с throw Error

### 5. Закомментировать статическую подачу в main.ts
```typescript
// app.useStaticAssets(join(__dirname, '..', 'uploads'), {
//   prefix: '/uploads/',
// });
```

### 6. Перезапустить сервис
```bash
npm run start:dev
```

## 🔄 Возврат к локальному хранению

### 1. Изменить .env
```env
STORAGE_MODE=local
# Убрать AWS переменные
```

### 2. Закомментировать AWS код в file.service.ts

### 3. Раскомментировать статическую подачу в main.ts

### 4. Перезапустить сервис

## 📋 Текущая конфигурация

### ✅ Активно (Локальное хранение)
- ✅ PostgreSQL для метаданных файлов
- ✅ Локальная папка `uploads/` для файлов
- ✅ Статическая подача через Express
- ✅ URL формат: `http://localhost:3008/uploads/filename`

### 💤 Готово к активации (AWS S3)
- 💤 AWS SDK закомментирован в коде
- 💤 S3 клиент подготовлен
- 💤 AWS зависимости в `_aws_dependencies_commented`
- 💤 URL формат: `https://bucket.s3.amazonaws.com/uploads/filename`

## 🎯 Преимущества подходов

### Локальное хранение
- ✅ Быстрая разработка
- ✅ Нет затрат на S3
- ✅ Простая настройка
- ❌ Не масштабируется
- ❌ Нет резервного копирования

### AWS S3
- ✅ Высокая надежность
- ✅ Автоматическое резервное копирование
- ✅ CDN интеграция
- ✅ Масштабируемость
- ❌ Дополнительные затраты
- ❌ Требует настройки AWS 