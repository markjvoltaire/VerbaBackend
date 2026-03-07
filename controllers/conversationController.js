const { getConversationResponse, getOpeningMessage } = require('../services/openai');

async function handleConversation(req, res) {
  try {
    const { scenario, messages, userAudio, language } = req.body;
    const targetLang = language || 'es';

    if (!scenario) {
      return res.status(400).json({ error: 'scenario required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      const mockMessages = {
        restaurant: 'Buenas tardes, ¿qué quiere pedir?',
        airport: '¿En qué puedo ayudarle hoy?',
        hotel: 'Buenas noches, ¿tiene una reserva?',
        small_talk: '¡Hola! ¿Cómo está usted?',
      };
      return res.json({
        aiMessage: mockMessages[scenario] || mockMessages.small_talk,
        feedback: null,
        transcription: null,
      });
    }

    let userTranscription = null;
    if (userAudio) {
      const { transcribeAudio } = require('../services/openai');
      const buffer = Buffer.from(userAudio, 'base64');
      userTranscription = await transcribeAudio(buffer, targetLang);
    }

    const aiMessage = await getConversationResponse(
      scenario,
      messages || [],
      userTranscription,
      targetLang
    );

    res.json({
      aiMessage,
      feedback: null,
      transcription: userTranscription,
    });
  } catch (err) {
    console.error('Conversation error:', err);
    res.status(500).json({ error: err.message || 'Conversation failed' });
  }
}

async function getOpening(req, res) {
  try {
    const { scenario, language } = req.query;
    const targetLang = language || 'es';
    if (!scenario) {
      return res.status(400).json({ error: 'scenario required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      const mock = {
        restaurant: 'Buenas tardes, ¿qué quiere pedir?',
        airport: '¿En qué puedo ayudarle hoy?',
        hotel: 'Buenas noches, ¿tiene una reserva?',
        small_talk: '¡Hola! ¿Cómo está usted?',
      };
      return res.json({ aiMessage: mock[scenario] || mock.small_talk });
    }

    const aiMessage = await getOpeningMessage(scenario, targetLang);
    res.json({ aiMessage });
  } catch (err) {
    console.error('Opening message error:', err);
    res.status(500).json({ error: err.message || 'Failed to get opening' });
  }
}

module.exports = { handleConversation, getOpening };
