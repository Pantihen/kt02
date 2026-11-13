const Joi = require('joi');
const { categories } = require('../config');

const fields = {
  name: Joi.string().trim().min(2).max(100),
  price: Joi.number().greater(0),
  category: Joi.string().valid(...categories),
  stock: Joi.number().integer().min(0),
  description: Joi.string().allow('').max(500),
};

// POST и PUT — полный объект товара
const productSchema = Joi.object({
  name: fields.name.required(),
  price: fields.price.required(),
  category: fields.category.required(),
  stock: fields.stock.default(0),
  description: fields.description,
});

// PATCH — любые поля, но хотя бы одно
const productPatchSchema = Joi.object({
  name: fields.name,
  price: fields.price,
  category: fields.category,
  stock: fields.stock,
  description: fields.description,
}).min(1);

// Query-параметры GET /api/products
const productQuerySchema = Joi.object({
  category: fields.category,
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0).when('minPrice', {
    is: Joi.exist(),
    then: Joi.number().min(Joi.ref('minPrice')),
  }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required(),
});

// Фабрика middleware: source — 'body' | 'query' | 'params'
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source] ?? {}, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map((d) => ({
          field: d.path.join('.') || source,
          message: d.message.replace(/"/g, ''),
        })),
      });
    }

    // Сохраняем очищенные и приведённые к типам данные отдельно от исходных
    req.validated = { ...(req.validated || {}), [source]: value };
    next();
  };
}

module.exports = {
  validate,
  productSchema,
  productPatchSchema,
  productQuerySchema,
  idParamSchema,
};
