import express from 'express';
import bodyParser from 'body-parser';
import { predictEmotions, isNegativeEmotion, shouldTriggerAssistant } from './predictSentiment';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(bodyParser.json());

// In-memory history for demo (replace with DB for production)
const entries: { id: string, text: string, emotions: string[] }[] = [];
const predictionHistory: string[][] = [];
const NEGATIVITY_THRESHOLD = 0.5;
const HISTORY_WINDOW = 5;

// Example coping suggestions with tags
const COPING_SUGGESTIONS = [
  {
    suggestion_id: "1",
    text: "Try taking a few deep breaths and focusing on the present moment.",
    emotion_tag: "anxiety",
    suggestion_type_tag: "Mindfulness"
  },
  {
    suggestion_id: "2",
    text: "Consider writing down three things you're grateful for today.",
    emotion_tag: "sadness",
    suggestion_type_tag: "Gratitude"
  },
  {
    suggestion_id: "3",
    text: "Reach out to a friend or loved one for support.",
    emotion_tag: "frustrated",
    suggestion_type_tag: "Social support"
  },
  {
    suggestion_id: "4",
    text: "If negative feelings persist, consider seeking therapy.",
    emotion_tag: "anxiety",
    suggestion_type_tag: "Seek therapy"
  }
];

// Helper to save suggestion to a JSON file "suggestions_db.json"
function saveSuggestionToDB(suggestionObj: any) {
  const dbPath = path.join(__dirname, 'suggestions_db.json');
  let db: any[] = [];
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  }
  db.push(suggestionObj);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// POST /predict
app.post('/predict', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }
  const emotions = predictEmotions(text);
  const negative = isNegativeEmotion(emotions);

  // Add to history with a generated journal_entry_id
  const entryId = Date.now().toString();
  entries.push({ id: entryId, text, emotions });

  // Keep only the most recent HISTORY_WINDOW entries
  predictionHistory.push(emotions);
  if (predictionHistory.length > HISTORY_WINDOW) {
    predictionHistory.shift();
  }

  let suggestion: typeof COPING_SUGGESTIONS[number] | null = null;

  // If negativity threshold is surpassed, save suggestion with related entry IDs
  if (shouldTriggerAssistant(predictionHistory, NEGATIVITY_THRESHOLD)) {
    // For demonstration, pick the first suggestion (customize as needed)
    suggestion = COPING_SUGGESTIONS[0];
    if (suggestion) {
      const suggestionRecord = {
        suggestion_id: suggestion.suggestion_id,
        timestamp: new Date().toISOString(),
        text: suggestion.text,
        journal_entry_ids: entries.slice(-HISTORY_WINDOW).map(e => e.id),
        emotion_tag: suggestion.emotion_tag,
        suggestion_type_tag: suggestion.suggestion_type_tag
      };
      saveSuggestionToDB(suggestionRecord);
    }
  }

  res.json({ emotions, negative, suggestion: suggestion ? suggestion.text : null });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Emotion prediction API running on port ${PORT}`);
});