const express = require('express');
const router = express.Router();
const { logProgress, getProgress } = require('../controllers/progressController');

router.post('/', logProgress);
router.get('/', getProgress);

module.exports = router;
