const express = require('express');
const router = express.Router();
const { upsertUser, setPlanToPro, getPlan } = require('../controllers/userController');

router.get('/plan', getPlan);
router.post('/', upsertUser);
router.post('/plan', setPlanToPro);

module.exports = router;
