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
  const { lang, scenario } = req.query;
  let phrases = loadPhrases();

  if (lang) {
    phrases = phrases.filter((p) => p.target_lang === lang);
  }
  if (scenario) {
    phrases = phrases.filter((p) => p.scenario === scenario);
  }

  res.json(phrases);
}

module.exports = { getPhrases };
