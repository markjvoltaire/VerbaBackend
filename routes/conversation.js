const express = require('express');
const { handleConversation, getOpening } = require('../controllers/conversationController');

const router = express.Router();

router.get('/opening', getOpening);
router.post('/', handleConversation);

module.exports = router;
