const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { uploadDir, maxFileSize, allowedMimeTypes } = require('../config');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${req.params.id}-${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  const err = new Error('Разрешены только изображения JPEG и PNG');
  err.status = 400;
  cb(err);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize, files: 1 },
});

module.exports = upload;
