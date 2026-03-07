const express = require('express');
const { getPhrases } = require('../controllers/phrasesController');

const router = express.Router();
router.get('/', getPhrases);

module.exports = router;
