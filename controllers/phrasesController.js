const fs = require('fs');
const path = require('path');

let phrasesCache = null;

function loadPhrases() {
  if (phrasesCache) return phrasesCache;
  const filePath = path.join(__dirname, '../data/phrases.json');
  if (fs.existsSync(filePath)) {
    phrasesCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return phrasesCache;
  }
  return [];
}

function getPhrases(req, res) {
  const { lang, scenario, limit } = req.query;
  let phrases = loadPhrases();

  if (lang) {
    phrases = phrases.filter((p) => p.target_lang === lang);
  }
  if (scenario) {
    phrases = phrases.filter((p) => p.scenario === scenario);
  }

  const max = limit ? parseInt(limit, 10) : 100;
  if (!isNaN(max) && max > 0) {
    phrases = phrases.slice(0, max);
  }

  res.json(phrases);
}

module.exports = { getPhrases };
