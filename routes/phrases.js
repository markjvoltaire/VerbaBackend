const express = require('express');
const { getPhrases, getLessons } = require('../controllers/phrasesController');

const router = express.Router();
router.get('/', getPhrases);
router.get('/scenarios', getLessons);

module.exports = router;
