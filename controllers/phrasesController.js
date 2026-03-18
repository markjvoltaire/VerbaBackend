const fs = require('fs');
const path = require('path');

const PHRASES_DIR = path.join(__dirname, '../data/phrases');

/**
 * Loads and expands phrases from per-scenario JSON files.
 * New format: { phrase, translations: { es, fr, it, en }, difficulty }
 * Returns flat array: { id, target_lang, phrase, translation, scenario, difficulty }
 */
function loadPhrases() {
  const result = [];
  if (!fs.existsSync(PHRASES_DIR)) return result;

  const files = fs.readdirSync(PHRASES_DIR).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const scenario = file.replace('.json', '');
    const filePath = path.join(PHRASES_DIR, file);
    const phrases = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (let i = 0; i < phrases.length; i++) {
      const p = phrases[i];
      const translation = p.phrase || '';
      const translations = p.translations || {};
      const difficulty = p.difficulty || 'Beginner';
      for (const [lang, text] of Object.entries(translations)) {
        if (!text) continue;
        result.push({
          id: `${scenario}_${lang}_${i}`,
          target_lang: lang,
          phrase: text,
          translation,
          scenario,
          difficulty,
        });
      }
    }
  }
  return result;
}

function loadScenariosMetadata() {
  const filePath = path.join(__dirname, '../data/scenarios.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return [];
}

function getLessons(req, res) {
  const { lang } = req.query;
  const phrases = loadPhrases();
  const metadata = loadScenariosMetadata();
  const metadataById = Object.fromEntries(metadata.map((m) => [m.id, m]));

  const scenarioCounts = {};
  phrases.forEach((p) => {
    if (!p.scenario) return;
    if (lang && p.target_lang !== lang) return;
    scenarioCounts[p.scenario] = (scenarioCounts[p.scenario] || 0) + 1;
  });

  const lessons = Object.keys(scenarioCounts)
    .sort()
    .map((scenarioId) => {
      const meta = metadataById[scenarioId] || {};
      return {
        id: scenarioId,
        scenario: scenarioId,
        label: meta.label || scenarioId.replace(/_/g, ' '),
        description: meta.description || '',
        icon: meta.icon || '📖',
        difficulty: meta.difficulty || 'beginner',
        phraseCount: scenarioCounts[scenarioId],
      };
    })
    .filter((l) => l.phraseCount > 0);

  res.json(lessons);
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
    const levelMap = {
      easy: 'Beginner',
      medium: 'Intermediate',
      hard: 'Advanced',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      advance: 'Advanced',
    };
    const normalized =
      levelMap[String(difficulty).toLowerCase()] || difficulty;
    phrases = phrases.filter((p) => p.difficulty === normalized);
  }

  const max = limit ? parseInt(limit, 10) : 100;
  if (!isNaN(max) && max > 0) {
    phrases = phrases.slice(0, max);
  }

  res.json(phrases);
}

module.exports = { getPhrases, getLessons };
