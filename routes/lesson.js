const express = require("express");
const router = express.Router();
const { getIntro } = require("../controllers/lessonController");

router.get("/intro", getIntro);

module.exports = router;
