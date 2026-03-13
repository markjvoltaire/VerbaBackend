const express = require('express');
const router = express.Router();
const { upsertUser } = require('../controllers/userController');

router.post('/', upsertUser);

module.exports = router;
