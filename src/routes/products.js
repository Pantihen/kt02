const fs = require('fs');
const path = require('path');
const express = require('express');
const upload = require('../middleware/upload');
const { uploadDir } = require('../config');
const {
  validate,
  productSchema,
  productPatchSchema,
  productQuerySchema,
  idParamSchema,
} = require('../middleware/validate');

const router = express.Router();

// Хранилище в памяти
const products = [];
let nextId = 1;

function findProduct(req, res) {
  const product = products.find((p) => p.id === req.validated.params.id);
  if (!product) {
    res.status(404).json({ error: `Товар с id ${req.params.id} не найден` });
    return null;
  }
  return product;
}

function removeImageFile(imageUrl) {
  if (!imageUrl) return;
  const filePath = path.join(uploadDir, path.basename(imageUrl));
  fs.unlink(filePath, () => {});
}

// GET /api/products — список с фильтрацией и пагинацией
router.get('/', validate(productQuerySchema, 'query'), (req, res) => {
  const { category, minPrice, maxPrice, page, limit } = req.validated.query;

  const filtered = products.filter(
    (p) =>
      (category === undefined || p.category === category) &&
      (minPrice === undefined || p.price >= minPrice) &&
      (maxPrice === undefined || p.price <= maxPrice)
  );

  const start = (page - 1) * limit;
  res.json({
    data: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  });
});

// GET /api/products/:id — один товар
router.get('/:id', validate(idParamSchema, 'params'), (req, res) => {
  const product = findProduct(req, res);
  if (product) res.json(product);
});

// POST /api/products — создать товар
router.post('/', validate(productSchema), (req, res) => {
  const product = {
    id: nextId++,
    ...req.validated.body,
    imageUrl: null,
    createdAt: new Date().toISOString(),
  };
  products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id — заменить товар полностью
router.put('/:id', validate(idParamSchema, 'params'), validate(productSchema), (req, res) => {
  const product = findProduct(req, res);
  if (!product) return;

  const { name, price, category, stock, description } = req.validated.body;
  Object.assign(product, { name, price, category, stock, description });
  if (description === undefined) delete product.description;

  res.json(product);
});

// PATCH /api/products/:id — обновить частично
router.patch('/:id', validate(idParamSchema, 'params'), validate(productPatchSchema), (req, res) => {
  const product = findProduct(req, res);
  if (!product) return;

  Object.assign(product, req.validated.body);
  res.json(product);
});

// DELETE /api/products/:id — удалить товар
router.delete('/:id', validate(idParamSchema, 'params'), (req, res) => {
  const product = findProduct(req, res);
  if (!product) return;

  products.splice(products.indexOf(product), 1);
  removeImageFile(product.imageUrl);
  res.status(204).end();
});

// POST /api/products/:id/image — загрузить изображение (поле формы: image)
router.post(
  '/:id/image',
  validate(idParamSchema, 'params'),
  (req, res, next) => {
    // Проверяем товар до сохранения файла на диск
    if (findProduct(req, res)) next();
  },
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'Validation error',
        details: [{ field: 'image', message: 'Файл изображения обязателен (поле image)' }],
      });
    }

    const product = products.find((p) => p.id === req.validated.params.id);
    removeImageFile(product.imageUrl);
    product.imageUrl = `/uploads/products/${req.file.filename}`;
    res.json(product);
  }
);

module.exports = router;
