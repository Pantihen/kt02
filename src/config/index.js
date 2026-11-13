const path = require('path');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '..', '..');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  uploadDir: path.resolve(ROOT_DIR, process.env.UPLOAD_DIR || 'uploads/products'),
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024, // 2 МБ
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  categories: ['electronics', 'clothing', 'food', 'other'],
};
