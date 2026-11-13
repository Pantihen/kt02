const multer = require('multer');

// 404 для несуществующих маршрутов
function notFound(req, res) {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.originalUrl} не найден` });
}

// Перехватывает все необработанные ошибки
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Размер файла не должен превышать 2 МБ'
        : err.message;
    return res.status(400).json({ error: message, code: err.code });
  }

  // Невалидный JSON в теле запроса
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некорректный JSON в теле запроса' });
  }

  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: status >= 500 ? 'Внутренняя ошибка сервера' : err.message,
  });
}

module.exports = { notFound, errorHandler };
