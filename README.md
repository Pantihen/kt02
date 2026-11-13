# kt02 — REST API каталога товаров

Express + Joi + Multer. Данные хранятся в памяти.

## Запуск

```bash
npm install
cp .env.example .env
npm start        # или npm run dev
```

## Маршруты

| Метод  | URL                       | Описание                                  |
|--------|---------------------------|-------------------------------------------|
| GET    | /api/products             | Список товаров с фильтрацией и пагинацией |
| GET    | /api/products/:id         | Один товар                                |
| POST   | /api/products             | Создать товар                             |
| PUT    | /api/products/:id         | Заменить товар полностью                  |
| PATCH  | /api/products/:id         | Обновить частично                         |
| DELETE | /api/products/:id         | Удалить товар                             |
| POST   | /api/products/:id/image   | Загрузить изображение (поле `image`)      |

Query-параметры списка: `category`, `minPrice`, `maxPrice`, `page` (по умолчанию 1), `limit` (по умолчанию 10).
Ответ: `{ data, total, page, limit }`.

## Поля товара

| Поле        | Тип    | Ограничения                                          |
|-------------|--------|------------------------------------------------------|
| id          | number | Генерируется автоматически                           |
| name        | string | Обязательное, 2–100 символов                         |
| price       | number | Обязательное, больше 0                               |
| category    | string | Обязательное: electronics, clothing, food, other     |
| stock       | number | Целое, минимум 0, по умолчанию 0                     |
| description | string | Опциональное, максимум 500 символов                  |
| imageUrl    | string | Заполняется при загрузке изображения                 |
| createdAt   | string | Генерируется автоматически                           |

## Middleware

- `logger.js` — выводит метод, URL, статус и время выполнения запроса
- `validate.js` — валидация Joi; при ошибке `400 { error, details: [{ field, message }] }`
- `upload.js` — Multer: только JPEG/PNG, максимум 2 МБ
- `errorHandler.js` — перехват всех необработанных ошибок и 404

## Примеры

```bash
curl -X POST localhost:3000/api/products -H 'Content-Type: application/json' \
  -d '{"name":"iPhone","price":999,"category":"electronics","stock":3}'

curl 'localhost:3000/api/products?category=electronics&minPrice=100&page=1&limit=5'

curl -X POST localhost:3000/api/products/1/image -F 'image=@photo.jpg'
```
