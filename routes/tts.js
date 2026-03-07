const express = require('express');
const { createSpeech, createSpeechStream } = require('../controllers/ttsController');

const router = express.Router();
router.post('/', createSpeech);
router.get('/stream', createSpeechStream);

module.exports = router;
