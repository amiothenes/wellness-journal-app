import { buildTfIdf, getTfIdfVector } from './preprocess';
import { Matrix } from 'ml-matrix';
// @ts-ignore
import LogisticRegression from 'ml-logistic-regression';
import fs from 'fs';
import path from 'path';

// Emotion columns from dataset (must match training)
const EMOTIONS = [
  "Answer.f1.afraid.raw", "Answer.f1.angry.raw", "Answer.f1.anxious.raw", "Answer.f1.ashamed.raw", "Answer.f1.awkward.raw",
  "Answer.f1.bored.raw", "Answer.f1.calm.raw", "Answer.f1.confused.raw", "Answer.f1.disgusted.raw", "Answer.f1.excited.raw",
  "Answer.f1.frustrated.raw", "Answer.f1.happy.raw", "Answer.f1.jealous.raw", "Answer.f1.nostalgic.raw", 
  "Answer.f1.proud.raw", "Answer.f1.sad.raw", "Answer.f1.satisfied.raw", "Answer.f1.surprised.raw"
];

// Load the enhanced TF-IDF data and rebuild vocabulary mapping
const tfidfDataJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'sentiment_tfidf_data.json'), 'utf-8'));
const docs = JSON.parse(fs.readFileSync(path.join(__dirname, 'sentiment_tfidf_docs.json'), 'utf-8'));

// Reconstruct the TF-IDF data structure
const vocabulary: string[] = tfidfDataJson.vocabulary;
const termToIndex: Map<string, number> = new Map<string, number>(
  // Ensure the entries are [string, number]
  (tfidfDataJson.termToIndex as Array<[string, number]>)
);

// Rebuild TF-IDF using the same vocabulary and documents
const tfidf = buildTfIdf(docs, 2, 4000); // Use same parameters as training

// Create the tfidfData object
const tfidfData: { tfidf: any; vocabulary: string[]; termToIndex: Map<string, number> } = {
  tfidf: tfidf.tfidf,
  vocabulary: vocabulary,
  termToIndex: termToIndex
};

// Load models
const modelJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'sentiment_logreg_models.json'), 'utf-8'));
const models = modelJson.map((m: any) => LogisticRegression.load(m));

// Enhanced prediction function
export function predictEmotions(text: string, threshold: number = 0.5): string[] {
  try {
    // Get TF-IDF vector using the enhanced preprocessing
    const vector = getTfIdfVector(tfidfData, text);
    
    // Ensure vector has the correct dimensions
    if (vector.length !== vocabulary.length) {
      console.warn(`Vector dimension mismatch. Expected: ${vocabulary.length}, Got: ${vector.length}`);
      return [];
    }
    
    // Create input matrix (must be 2D)
    const inputMatrix = new Matrix([vector]);
    
    // Get predictions from all models
    const predictions = models
      .map((model: any, idx: number) => {
        try {
          const prediction = model.predict(inputMatrix);
          // Handle both array and single value predictions
          const prob = Array.isArray(prediction) ? prediction[0] : prediction;
          return {
            emotion: EMOTIONS[idx],
            prob: typeof prob === 'number' ? prob : 0
          };
        } catch (error) {
          console.warn(`Prediction error for ${EMOTIONS[idx]}:`, error);
          return {
            emotion: EMOTIONS[idx],
            prob: 0
          };
        }
      })
      .filter((res: { emotion: string; prob: number }) => res.prob >= threshold)
      .map((res: { emotion: string; prob: number }) => res.emotion);
    
    return predictions;
  } catch (error) {
    console.error('Error in predictEmotions:', error);
    return [];
  }
}

// Enhanced prediction with confidence scores - FIX THE TYPE ERRORS HERE
export function predictEmotionsWithConfidence(text: string, threshold: number = 0.4): Array<{emotion: string, confidence: number}> {
  try {
    if (!text || text.trim().length === 0) {
      return [];
    }
    
    const vector = getTfIdfVector(tfidfData, text);
    const inputMatrix = new Matrix([vector]);
    
    return models
      .map((model: any, idx: number) => {
        try {
          const prediction = model.predict(inputMatrix);
          const prob = Array.isArray(prediction) ? prediction[0] : prediction;
          return {
            emotion: EMOTIONS[idx],
            confidence: typeof prob === 'number' ? Math.max(0, Math.min(1, prob)) : 0
          };
        } catch (error) {
          return {
            emotion: EMOTIONS[idx],
            confidence: 0
          };
        }
      })
      .filter((res: {emotion: string, confidence: number}) => res.confidence >= threshold)
      .sort((a: {emotion: string, confidence: number}, b: {emotion: string, confidence: number}) => b.confidence - a.confidence);
  } catch (error) {
    console.error('Error in predictEmotionsWithConfidence:', error);
    return [];
  }
}

// Negativity detection logic
const NEGATIVE_EMOTIONS = [
  "Answer.f1.afraid.raw", "Answer.f1.angry.raw", "Answer.f1.anxious.raw", "Answer.f1.ashamed.raw", "Answer.f1.awkward.raw",
  "Answer.f1.bored.raw", "Answer.f1.confused.raw", "Answer.f1.disgusted.raw", "Answer.f1.frustrated.raw", "Answer.f1.sad.raw"
];

// Check if a list of predicted emotions contains any negative emotions
export function isNegativeEmotion(predicted: string[]): boolean {
  return predicted.some(e => NEGATIVE_EMOTIONS.includes(e));
}

// Check if negativity threshold is surpassed in history of predictions
export function shouldTriggerAssistant(history: string[][], threshold: number = 0.5): boolean {
  if (history.length === 0) return false;
  const negativeCount = history.filter(pred => isNegativeEmotion(pred)).length;
  return (negativeCount / history.length) >= threshold;
}