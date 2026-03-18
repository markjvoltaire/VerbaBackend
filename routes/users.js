const express = require('express');
const router = express.Router();
const { upsertUser, setPlanToPro, getPlan, checkUserExists } = require('../controllers/userController');

router.get('/exists', checkUserExists);
router.get('/plan', getPlan);
router.post('/', upsertUser);
router.post('/plan', setPlanToPro);

module.exports = router;
