require('dotenv').config();
const express = require('express');
const cors = require('cors');
const speechRoutes = require('./routes/speech');
const conversationRoutes = require('./routes/conversation');
const phrasesRoutes = require('./routes/phrases');
const translateRoutes = require('./routes/translate');
const ttsRoutes = require('./routes/tts');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('Verba API is running');
});

app.use('/phrases', phrasesRoutes);
app.use('/speech-evaluate', speechRoutes);
app.use('/conversation', conversationRoutes);
app.use('/translate', translateRoutes);
app.use('/tts', ttsRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
