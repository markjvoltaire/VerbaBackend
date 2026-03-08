const OpenAI = require('openai');

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

async function translate(req, res) {
  try {
    const { text, targetLang, literal } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text required' });
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return res.json({ translation: '' });
    }

    const lang = targetLang || 'es';
    const langNames = { es: 'Spanish', fr: 'French', it: 'Italian', en: 'English' };
    const targetName = langNames[lang] || 'Spanish';
    const wordForWord = literal === true;

    const openai = getOpenAI();
    if (!openai) {
      return res.json({
        translation: trimmed,
        note: 'Configure OPENAI_API_KEY for live translation',
      });
    }

    const systemContent = wordForWord
      ? `You are a literal translator. Translate the user's input to ${targetName} WORD FOR WORD.
If the input is in ${targetName}, translate to English WORD FOR WORD.
Preserve the original structure and order. One word or short phrase maps to one word or short phrase. Do not paraphrase, use idioms, or make it sound natural. Translate each word as literally as possible.
Return ONLY the translation, nothing else. No explanations.`
      : `You are a translator. Translate the user's input to ${targetName}. 
If the input is in ${targetName}, translate to English.
Return ONLY the translation, nothing else. No explanations.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: trimmed },
      ],
      max_tokens: 150,
    });

    const translation = response.choices[0]?.message?.content?.trim() || trimmed;
    res.json({ translation });
  } catch (err) {
    console.error('Translate error:', err);
    res.status(500).json({ error: err.message || 'Translation failed' });
  }
}

module.exports = { translate };
