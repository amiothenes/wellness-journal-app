import { loadDataset, buildTfIdf, getTfIdfVector } from './preprocess';
// @ts-ignore
import LogisticRegression from 'ml-logistic-regression';
import fs from 'fs';
import path from 'path';
import { Matrix } from 'ml-matrix';

// List of emotion columns to be predicted (multi-label classification)
const EMOTIONS = [
  "Answer.f1.afraid.raw", "Answer.f1.angry.raw", "Answer.f1.anxious.raw", "Answer.f1.ashamed.raw", "Answer.f1.awkward.raw",
  "Answer.f1.bored.raw", "Answer.f1.calm.raw", "Answer.f1.confused.raw", "Answer.f1.disgusted.raw", "Answer.f1.excited.raw",
  "Answer.f1.frustrated.raw", "Answer.f1.happy.raw", "Answer.f1.jealous.raw", "Answer.f1.nostalgic.raw", 
  "Answer.f1.proud.raw", "Answer.f1.sad.raw", "Answer.f1.satisfied.raw", "Answer.f1.surprised.raw"
];

// Load and slice dataset (slice for faster dev)
const data = loadDataset(); 

// Extract the text entries from the dataset for TF-IDF processing
const docs = data.map((row: any) => row.Answer); // 'Answer' is the text column

// For each entry, create a binary array for each emotion (multi-label, one-vs-rest)
const labels = data.map((row: any) =>
  EMOTIONS.map(emotion => (row[emotion] === "TRUE" || row[emotion] === true ? 1 : 0))
);

// Build enhanced TF-IDF features with better parameters
console.log('\nStarting optimized TF-IDF...');
const tfidfData = buildTfIdf(docs, 1, 6000); 
console.log(`Vocabulary size: ${tfidfData.vocabulary.length}`);

console.log('TF-IDF done. Starting vectorization...');

// Convert each document into a TF-IDF vector using model's vocabulary
const vectors = docs.map((doc, i) => getTfIdfVector(tfidfData, doc, i));
console.log('Vectorization done. Starting training...');

// Validate vectors
console.log(`Vector dimensions: ${vectors.length} x ${vectors[0]?.length || 0}`);

// Train one logistic regression model per emotion with improved hyperparameters
console.time('Training');
const models = EMOTIONS.map((emotion, idx) => {
  // Get binary labels for current emotion
  const y = labels.map(row => row[idx]);
  const positiveCount = y.filter(label => label === 1).length;
  
  // Enhanced logistic regression with better hyperparameters
  const lr = new LogisticRegression({ 
    numSteps: Math.min(1200, Math.max(400, positiveCount * 4)),
    learningRate: 3e-4, // Even lower for stability
    regularization: 0.01 // Very light regularization
  });
  
  lr.train(new Matrix(vectors), Matrix.columnVector(y));
  console.log(`Trained model for ${emotion} (${y.filter(label => label === 1).length} samples)`);
  return lr;
});
console.timeEnd('Training');

// Save trained models and complete TF-IDF data
fs.writeFileSync(path.join(__dirname, 'sentiment_logreg_models.json'), JSON.stringify(models.map(m => m.toJSON())));

// Save the complete TF-IDF data structure
fs.writeFileSync(path.join(__dirname, 'sentiment_tfidf_data.json'), JSON.stringify({
  vocabulary: tfidfData.vocabulary,
  termToIndex: Array.from(tfidfData.termToIndex.entries()),
  minFreq: 2,
  maxFeatures: 4000
}));

// Save training docs for reference
fs.writeFileSync(path.join(__dirname, 'sentiment_tfidf_docs.json'), JSON.stringify(docs));

console.log('Enhanced models and TF-IDF data saved successfully.');