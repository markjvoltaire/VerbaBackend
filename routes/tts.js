const express = require('express');
const { createSpeech, createSpeechStream, createSpeechWithWords } = require('../controllers/ttsController');

const router = express.Router();
router.post('/', createSpeech);
router.post('/with-words', createSpeechWithWords);
router.get('/stream', createSpeechStream);

module.exports = router;
