// Кастомный логгер: метод, URL, статус и время выполнения запроса
function logger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const time = new Date().toISOString();
    console.log(`[${time}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms.toFixed(2)} ms`);
  });

  next();
}

module.exports = logger;
