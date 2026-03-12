const fs = require('fs');
const path = require('path');

function loadPhrases() {
  const filePath = path.join(__dirname, '../data/phrases.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return [];
}

function getPhrases(req, res) {
  const { lang, scenario, difficulty, limit } = req.query;
  let phrases = loadPhrases();

  if (lang) {
    phrases = phrases.filter((p) => p.target_lang === lang);
  }
  if (scenario) {
    phrases = phrases.filter((p) => p.scenario === scenario);
  }
  if (difficulty) {
    phrases = phrases.filter((p) => p.difficulty === difficulty);
  }

  const max = limit ? parseInt(limit, 10) : 100;
  if (!isNaN(max) && max > 0) {
    phrases = phrases.slice(0, max);
  }

  res.json(phrases);
}

module.exports = { getPhrases };
