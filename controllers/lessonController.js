const { getLessonIntro } = require('../services/openai');

async function getIntro(req, res) {
  try {
    const { scenario, nativeLang, targetLang } = req.query;
    const native = nativeLang || 'es';
    const target = targetLang || 'es';

    if (!scenario) {
      return res.status(400).json({ error: 'scenario required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      const mockGreeting = {
        es: '¡Hola! Bienvenido a la lección.',
        fr: 'Bonjour! Bienvenue à la leçon.',
        it: 'Ciao! Benvenuto alla lezione.',
        en: 'Hello! Welcome to the lesson.',
      };
      const mockExplanation = {
        es: 'Hoy vamos a practicar frases. Te diré una frase y tú la repites.',
        fr: "Aujourd'hui nous allons pratiquer des phrases. Je vais te dire une phrase et tu la répètes.",
        it: "Oggi praticheremo delle frasi. Ti dirò una frase e tu la ripeti.",
        en: "Today we'll practice phrases. I'll say a phrase and you repeat it.",
      };
      return res.json({
        greeting: mockGreeting[native] || mockGreeting.es,
        explanation: mockExplanation[native] || mockExplanation.es,
      });
    }

    const { greeting, explanation } = await getLessonIntro(scenario, native, target);
    res.json({ greeting, explanation });
  } catch (err) {
    console.error('Lesson intro error:', err);
    res.status(500).json({ error: err.message || 'Failed to get lesson intro' });
  }
}

module.exports = { getIntro };
