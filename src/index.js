const express = require('express');
const config = require('./config');
const logger = require('./middleware/logger');
const productsRouter = require('./routes/products');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(logger);
app.use(express.json());
app.use('/uploads/products', express.static(config.uploadDir));

app.use('/api/products', productsRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});

module.exports = app;
