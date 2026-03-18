#!/usr/bin/env node
/**
 * Migrates phrases.json to the new per-scenario format.
 * Run: node scripts/migrate-phrases.js
 */

const fs = require('fs');
const path = require('path');

const OLD_PATH = path.join(__dirname, '../data/phrases.json');
const NEW_DIR = path.join(__dirname, '../data/phrases');

const oldPhrases = JSON.parse(fs.readFileSync(OLD_PATH, 'utf8'));

// Group by (scenario, translation) -> { translations: { lang: phrase }, difficulty }
const grouped = {};
for (const p of oldPhrases) {
  if (!p.scenario) continue;
  const key = `${p.scenario}::${p.translation}`;
  if (!grouped[key]) {
    grouped[key] = { phrase: p.translation, translations: {}, difficulty: p.difficulty || 'Beginner' };
  }
  grouped[key].translations[p.target_lang] = p.phrase;
}

// Build per-scenario files
const byScenario = {};
for (const [key, value] of Object.entries(grouped)) {
  const [scenario] = key.split('::');
  if (!byScenario[scenario]) byScenario[scenario] = [];
  byScenario[scenario].push(value);
}

if (!fs.existsSync(NEW_DIR)) {
  fs.mkdirSync(NEW_DIR, { recursive: true });
}

for (const [scenario, phrases] of Object.entries(byScenario)) {
  const filePath = path.join(NEW_DIR, `${scenario}.json`);
  fs.writeFileSync(filePath, JSON.stringify(phrases, null, 2), 'utf8');
  console.log(`Created ${scenario}.json (${phrases.length} phrases)`);
}

console.log('Migration complete.');
