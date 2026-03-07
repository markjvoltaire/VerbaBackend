const express = require('express');
const multer = require('multer');
const { evaluateSpeech } = require('../controllers/speechController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/', upload.single('audio'), evaluateSpeech);

module.exports = router;
