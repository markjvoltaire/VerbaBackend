const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

async function transcribeAudio(audioBuffer, language = 'es') {
  const openai = getOpenAI();
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const tempPath = path.join(__dirname, '../tmp/audio.m4a');
  fs.mkdirSync(path.dirname(tempPath), { recursive: true });
  fs.writeFileSync(tempPath, audioBuffer);
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: 'whisper-1',
      language,
    });
    return transcription.text;
  } finally {
    try {
      fs.unlinkSync(tempPath);
    } catch {}
  }
}

async function evaluatePronunciation(transcription, expectedPhrase) {
  const openai = getOpenAI();
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a language tutor. Compare the user's transcription with the expected phrase. 
Return JSON only: { "feedback": "brief feedback string", "score": number 0-100 }.
Score based on: correct words, pronunciation accuracy (inferred from transcription), grammar.
Be encouraging but accurate.`,
      },
      {
        role: 'user',
        content: `User said: "${transcription}"\nExpected phrase: "${expectedPhrase}"`,
      },
    ],
    response_format: { type: 'json_object' },
  });
  return JSON.parse(response.choices[0].message.content);
}

const LANG_NAMES = { es: 'Spanish', fr: 'French', it: 'Italian', en: 'English' };

async function getConversationResponse(scenario, messages, userTranscription, language = 'es') {
  const openai = getOpenAI();
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const langName = LANG_NAMES[language] || 'Spanish';
  const scenarioPrompts = {
    restaurant: `You are a ${langName} waiter at a restaurant. Speak naturally in ${langName}. Keep responses short (1-2 sentences).`,
    airport: `You are ${langName}-speaking airport staff. Help the traveler. Speak in ${langName}. Keep responses short.`,
    hotel: `You are a ${langName} hotel receptionist. Speak in ${langName}. Keep responses short.`,
    small_talk: `You are a friendly ${langName} speaker having small talk. Speak in ${langName}. Keep responses short.`,
  };
  const systemPrompt = scenarioPrompts[scenario] || scenarioPrompts.small_talk;

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];
  if (userTranscription) {
    formattedMessages.push({
      role: 'user',
      content: `[User just said: "${userTranscription}"]`,
    });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: formattedMessages,
  });
  return response.choices[0].message.content;
}

async function getOpeningMessage(scenario, language = 'es') {
  const openai = getOpenAI();
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const langName = LANG_NAMES[language] || 'Spanish';
  const prompts = {
    restaurant: `Generate a single short greeting a ${langName} waiter would say when a customer arrives. Only output the ${langName} text, nothing else.`,
    airport: `Generate a single short question ${langName} airport staff would ask a traveler. Only output the ${langName} text, nothing else.`,
    hotel: `Generate a single short greeting a ${langName} hotel receptionist would say. Only output the ${langName} text, nothing else.`,
    small_talk: `Generate a single short greeting in ${langName} for small talk. Only output the ${langName} text, nothing else.`,
  };
  const prompt = prompts[scenario] || prompts.small_talk;
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });
  return response.choices[0].message.content.trim();
}

async function getLessonIntro(scenario, nativeLang, targetLang) {
  const openai = getOpenAI();
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const nativeName = LANG_NAMES[nativeLang] || 'Spanish';
  const targetName = LANG_NAMES[targetLang] || 'Spanish';
  const scenarioLabels = {
    restaurant: 'ordering at a restaurant',
    airport: 'navigating the airport',
    hotel: 'checking in at a hotel',
    small_talk: 'basic introductions and small talk',
  };
  const topic = scenarioLabels[scenario] || scenarioLabels.small_talk;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are Verba, a friendly language tutor. Generate a lesson intro in ${nativeName} (the user's native language).
The user is learning ${targetName}. Today's lesson covers ${topic}.

Return JSON only with exactly two keys:
- "greeting": A short, warm welcome (1 sentence) in ${nativeName}
- "explanation": A brief explanation (1-2 sentences) in ${nativeName} of what we'll do: you'll say a phrase in ${targetName}, they repeat it, and you'll give feedback. Keep it encouraging.`,
      },
      { role: 'user', content: 'Generate the lesson intro.' },
    ],
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(response.choices[0].message.content);
  return {
    greeting: (parsed.greeting || '').trim(),
    explanation: (parsed.explanation || '').trim(),
  };
}

module.exports = { transcribeAudio, evaluatePronunciation, getConversationResponse, getOpeningMessage, getLessonIntro };
