const OpenAI = require('openai');

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

async function createSpeech(req, res) {
  try {
    const { text, voice = 'marin', language } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text required' });
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return res.status(400).json({ error: 'text cannot be empty' });
    }

    const openai = getOpenAI();
    if (!openai) {
      return res.status(503).json({ error: 'OPENAI_API_KEY not configured' });
    }

    const langInstructions = {
      es: 'Speak in Spanish with natural pronunciation.',
      fr: 'Speak in French with natural pronunciation.',
      it: 'Speak in Italian with natural pronunciation.',
      en: 'Speak in English with natural pronunciation.',
    };
    const instructions = language ? langInstructions[language] : undefined;

    const speech = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: voice,
      input: trimmed,
      ...(instructions && { instructions }),
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    const base64 = buffer.toString('base64');
    res.json({ audio: base64, format: 'mp3' });
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err.message || 'TTS failed' });
  }
}

async function createSpeechStream(req, res) {
  try {
    const { text, voice = 'marin', language } = req.query;

    if (!text || typeof text !== 'string') {
      return res.status(400).send('text required');
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return res.status(400).send('text cannot be empty');
    }

    const openai = getOpenAI();
    if (!openai) {
      return res.status(503).send('OPENAI_API_KEY not configured');
    }

    const langInstructions = {
      es: 'Speak in Spanish with natural pronunciation.',
      fr: 'Speak in French with natural pronunciation.',
      it: 'Speak in Italian with natural pronunciation.',
      en: 'Speak in English with natural pronunciation.',
    };
    const instructions = language ? langInstructions[language] : undefined;

    const speech = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: voice,
      input: trimmed,
      ...(instructions && { instructions }),
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (err) {
    console.error('TTS stream error:', err);
    res.status(500).send(err.message || 'TTS failed');
  }
}

module.exports = { createSpeech, createSpeechStream };
