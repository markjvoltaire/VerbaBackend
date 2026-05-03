/**
 * One-off: add translations.pt (Brazilian Portuguese) from English phrase field.
 * Requires OPENAI_API_KEY (or .env in project root). Idempotent: skips entries that already have pt.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const PHRASES_DIR = path.join(__dirname, '../data/phrases');
const BATCH_SIZE = 22;

async function translateBatch(openai, englishPhrases) {
  const userPayload = JSON.stringify({ phrases: englishPhrases });
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Translate each English phrase to natural Brazilian Portuguese. Preserve tone (questions, imperatives, casual vs formal).
Return JSON only with this exact shape: {"translations":["..."]} — array of strings in the same order and length as input.phrases. No extra keys.`,
      },
      { role: 'user', content: userPayload },
    ],
    response_format: { type: 'json_object' },
  });
  const raw = response.choices[0]?.message?.content?.trim();
  const parsed = JSON.parse(raw);
  const out = parsed.translations;
  if (!Array.isArray(out) || out.length !== englishPhrases.length) {
    throw new Error(
      `Batch length mismatch: expected ${englishPhrases.length}, got ${out?.length}`,
    );
  }
  return out.map((s) => String(s).trim());
}

async function processFile(openai, filePath) {
  const name = path.basename(filePath);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const indices = [];
  const toTranslate = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || typeof row !== 'object') continue;
    const tr = row.translations || {};
    if (tr.pt && String(tr.pt).trim()) continue;
    const en = row.phrase;
    if (!en || typeof en !== 'string') continue;
    indices.push(i);
    toTranslate.push(en.trim());
  }
  if (toTranslate.length === 0) {
    console.log(`  skip ${name} (already complete)`);
    return 0;
  }
  console.log(`  ${name}: translating ${toTranslate.length} phrases...`);
  let done = 0;
  for (let start = 0; start < toTranslate.length; start += BATCH_SIZE) {
    const slice = toTranslate.slice(start, start + BATCH_SIZE);
    const idxSlice = indices.slice(start, start + BATCH_SIZE);
    let attempts = 0;
    let ptSlice;
    while (attempts < 3) {
      attempts += 1;
      try {
        ptSlice = await translateBatch(openai, slice);
        break;
      } catch (e) {
        console.error(`    batch retry ${attempts}:`, e.message);
        if (attempts >= 3) throw e;
        await new Promise((r) => setTimeout(r, 1500 * attempts));
      }
    }
    for (let j = 0; j < idxSlice.length; j++) {
      const row = data[idxSlice[j]];
      row.translations = row.translations || {};
      row.translations.pt = ptSlice[j];
      done += 1;
    }
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`  ${name}: wrote ${done} pt strings`);
  return done;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set. Add it to .env or the environment.');
    process.exit(1);
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const files = fs
    .readdirSync(PHRASES_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();
  let total = 0;
  for (const f of files) {
    const n = await processFile(openai, path.join(PHRASES_DIR, f));
    total += n;
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`Done. Added/updated ${total} Portuguese strings across ${files.length} files.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
