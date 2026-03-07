const { transcribeAudio, evaluatePronunciation } = require('../services/openai');

async function evaluateSpeech(req, res) {
  try {
    let audioBuffer;
    if (req.body?.audio) {
      audioBuffer = Buffer.from(req.body.audio, 'base64');
    } else if (req.file?.buffer) {
      audioBuffer = req.file.buffer;
    } else {
      return res.status(400).json({ error: 'No audio provided' });
    }

    const expectedPhrase = req.body.expectedPhrase || req.body.expected_phrase;
    if (!expectedPhrase) {
      return res.status(400).json({ error: 'expectedPhrase required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'Speech evaluation not configured',
        transcription: '[mock] ' + expectedPhrase,
        expectedPhrase,
        feedback: 'Configure OPENAI_API_KEY to enable pronunciation feedback.',
        score: 85,
      });
    }

    const transcription = await transcribeAudio(audioBuffer);
    const { feedback, score } = await evaluatePronunciation(transcription, expectedPhrase);

    res.json({
      transcription,
      expectedPhrase,
      feedback,
      score: Math.min(100, Math.max(0, score)),
    });
  } catch (err) {
    console.error('Speech evaluate error:', err);
    res.status(500).json({ error: err.message || 'Speech evaluation failed' });
  }
}

module.exports = { evaluateSpeech };
