import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import natural from 'natural';

// Path to training dataset
const DATA_PATH = path.join(__dirname, './data.csv');

// Read CSV
export function loadDataset() {
  const fileContent = fs.readFileSync(DATA_PATH, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });
  return records;
}

// Enhanced negation words - including contractions
const NEGATION_WORDS = new Set([
  'not', 'no', 'never', 'none', 'nobody', 'nothing', 'neither', 'nowhere',
  'cannot', 'cant', 'couldn\'t', 'shouldn\'t', 'wouldn\'t', 'don\'t', 'doesn\'t',
  'didn\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'haven\'t', 'hasn\'t',
  'won\'t', 'wouldn\'t', 'shan\'t', 'mustn\'t', 'needn\'t', 'daren\'t',
  'barely', 'hardly', 'rarely', 'seldom', 'scarcely', 'without'
]);

// Words that end negation scope
const NEGATION_ENDERS = new Set([
  'but', 'however', 'nevertheless', 'nonetheless', 'although', 'though',
  'yet', 'except', 'besides', 'despite', 'in', 'spite', 'of'
]);

// Enhanced text preprocessing with better contraction handling
export function preprocessText(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    // Handle contractions BEFORE removing punctuation
    .replace(/i'm/g, 'i am')
    .replace(/you're/g, 'you are')
    .replace(/he's/g, 'he is')
    .replace(/she's/g, 'she is')
    .replace(/it's/g, 'it is')
    .replace(/we're/g, 'we are')
    .replace(/they're/g, 'they are')
    .replace(/n't/g, ' not') // Convert contractions: don't -> do not, isn't -> is not
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\d+/g, ' ') // Remove numbers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Enhanced negation handling with better scope detection
export function handleNegation(tokens: string[]): string[] {
  const result: string[] = [];
  let inNegation = false;
  let negationDistance = 0;
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Check if current token is a negation word
    if (NEGATION_WORDS.has(token)) {
      inNegation = true;
      negationDistance = 0;
      result.push(token); // Keep the negation word
    }
    // Check if current token ends negation
    else if (NEGATION_ENDERS.has(token)) {
      inNegation = false;
      negationDistance = 0;
      result.push(token);
    }
    // If we're in negation scope, prefix the word with "NOT_"
    else if (inNegation && negationDistance < 4) { // Increased scope to 4 words
      result.push(`NOT_${token}`);
      negationDistance++;
      
      // Special handling for sentiment words - end negation after capturing them
      const sentimentWords = ['good', 'feel', 'feeling', 'well', 'fine', 'okay', 'great', 'bad', 'terrible', 'awful'];
      if (sentimentWords.includes(token)) {
        // Don't end negation immediately - let it continue for compound phrases
      }
    }
    // Normal word
    else {
      if (inNegation) {
        inNegation = false; // End negation scope after max distance
      }
      result.push(token);
    }
  }
  
  return result;
}

// Remove common stop words but keep important ones for sentiment
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'i', 'me', 'my', 'myself', 'we', 'our',
  'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

// Initialize a word tokenizer from 'natural' library
const tokenizer = new natural.WordTokenizer();

// Enhanced tokenization with better negation preservation
export function tokenize(text: string): string[] {
  // Step 1: Basic preprocessing (handles contractions)
  const preprocessed = preprocessText(text);
  
  // Step 2: Initial tokenization
  const tokens = tokenizer.tokenize(preprocessed) || [];
  
  // Step 3: Handle negation BEFORE filtering (crucial!)
  const negationHandled = handleNegation(tokens);
  
  // Step 4: Filter tokens but preserve negation context
  const filtered = negationHandled.filter(token => {
    // Always keep negation words and negated words
    if (token.startsWith('NOT_') || NEGATION_WORDS.has(token)) {
      return true;
    }
    // Filter normal words but keep sentiment-related words
    const sentimentWords = ['good', 'bad', 'feel', 'feeling', 'all', 'well', 'fine', 'great', 'terrible', 'awful', 'sad', 'happy'];
    if (sentimentWords.includes(token)) {
      return true;
    }
    return token.length > 2 && !STOP_WORDS.has(token);
  });
  
  // Step 5: Apply stemming carefully
  return filtered.map(token => {
    // Don't stem negated words (keep NOT_ prefix intact)
    if (token.startsWith('NOT_')) {
      const baseWord = token.substring(4);
      return `NOT_${natural.PorterStemmer.stem(baseWord)}`;
    }
    // Don't stem negation words themselves
    if (NEGATION_WORDS.has(token)) {
      return token;
    }
    // Stem normal words
    return natural.PorterStemmer.stem(token);
  });
}

// Extract n-grams from text
export function extractNGrams(tokens: string[], n: number): string[] {
  if (tokens.length < n) return [];
  
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join('_'));
  }
  return ngrams;
}

// Enhanced feature extraction with better negation patterns
export function extractFeatures(text: string): string[] {
  const tokens = tokenize(text);
  const features: string[] = [];
  
  // Add unigrams (single words) - including negated words
  features.push(...tokens);
  
  // Add bigrams - especially important for negation patterns
  if (tokens.length >= 2) {
    features.push(...extractNGrams(tokens, 2));
  }
  
  // Add trigrams for longer texts
  if (tokens.length >= 3) {
    features.push(...extractNGrams(tokens, 3));
  }
  
  // ENHANCED NEGATION PATTERN DETECTION
  const textLower = text.toLowerCase();
  
  // Explicit negation phrase patterns
  const negationPhrases = [
    'not feeling good', 'not good', 'not well', 'not fine', 'not okay',
    'don\'t feel good', 'doesn\'t feel good', 'not feeling well',
    'not feeling fine', 'not feeling okay', 'not feeling great'
  ];
  
  negationPhrases.forEach(phrase => {
    if (textLower.includes(phrase)) {
      features.push(`PHRASE_${phrase.replace(/\s+/g, '_').replace(/'/g, '')}`);
      features.push('EXPLICIT_NEGATIVE_SENTIMENT');
    }
  });
  
  // Detect "not...good" patterns with words in between
  if (textLower.includes('not') && textLower.includes('good')) {
    features.push('NOT_GOOD_PATTERN');
    features.push('NEGATIVE_SENTIMENT_STRONG');
  }
  
  // Detect intensifiers with negation
  if ((textLower.includes('not') || textLower.includes('no')) && 
      textLower.includes('at all')) {
    features.push('NEGATION_INTENSIFIER');
    features.push('VERY_NEGATIVE');
  }
  
  // Enhanced individual negation patterns
  for (let i = 0; i < tokens.length - 1; i++) {
    const current = tokens[i];
    const next = tokens[i + 1];
    
    // Standard negation patterns
    if (NEGATION_WORDS.has(current)) {
      features.push(`NEG_${next}`);
      
      // Special handling for feeling patterns
      if (next === 'feel' || next === 'feeling') {
        features.push('NOT_FEELING_PATTERN');
        
        // Look ahead for sentiment words
        for (let j = i + 2; j < Math.min(i + 5, tokens.length); j++) {
          if (['good', 'well', 'fine', 'okay', 'great', 'bad'].includes(tokens[j])) {
            features.push(`NOT_FEELING_${tokens[j].toUpperCase()}`);
          }
        }
      }
      
      // Direct negation of positive words
      if (['good', 'well', 'fine', 'okay', 'great', 'happy'].includes(next)) {
        features.push('DIRECT_POSITIVE_NEGATION');
        features.push(`ANTI_${next.toUpperCase()}`);
      }
    }
  }
  
  // Remove positive sentiment features if strong negation is detected
  const hasStrongNegation = features.some(f => 
    f.includes('EXPLICIT_NEGATIVE') || 
    f.includes('NOT_GOOD_PATTERN') || 
    f.includes('NEGATION_INTENSIFIER') ||
    f.includes('NOT_FEELING_GOOD')
  );
  
  if (hasStrongNegation) {
    // Add strong negative signal
    features.push('OVERRIDE_POSITIVE');
    features.push('STRONG_NEGATIVE_CONTEXT');
  }
  
  return features;
}

// Rest of the functions remain the same...
export function buildVocabulary(docs: string[], minFreq: number = 2): Set<string> {
  const termCounts = new Map<string, number>();
  
  docs.forEach(doc => {
    const features = extractFeatures(doc);
    const uniqueFeatures = new Set(features);
    
    uniqueFeatures.forEach(feature => {
      termCounts.set(feature, (termCounts.get(feature) || 0) + 1);
    });
  });
  
  const vocabulary = new Set<string>();
  termCounts.forEach((count, term) => {
    if (count >= minFreq) {
      vocabulary.add(term);
    }
  });
  
  return vocabulary;
}

export function buildTfIdf(docs: string[], minFreq: number = 2, maxFeatures?: number): {
  tfidf: natural.TfIdf;
  vocabulary: string[];
  termToIndex: Map<string, number>;
} {
  const vocabSet = buildVocabulary(docs, minFreq);
  let vocabulary = Array.from(vocabSet);
  
  if (maxFeatures && vocabulary.length > maxFeatures) {
    const docFreqs = new Map<string, number>();
    docs.forEach(doc => {
      const features = new Set(extractFeatures(doc));
      features.forEach(feature => {
        if (vocabSet.has(feature)) {
          docFreqs.set(feature, (docFreqs.get(feature) || 0) + 1);
        }
      });
    });
    
    // Prioritize negation and sentiment features
    vocabulary = vocabulary
      .sort((a, b) => {
        const aIsImportant = a.startsWith('NOT_') || a.startsWith('NEG_') || a.startsWith('NEGATIVE_') || a.includes('NEGATION_') ? 1 : 0;
        const bIsImportant = b.startsWith('NOT_') || b.startsWith('NEG_') || b.startsWith('NEGATIVE_') || b.includes('NEGATION_') ? 1 : 0;
        
        if (aIsImportant !== bIsImportant) {
          return bIsImportant - aIsImportant;
        }
        
        return (docFreqs.get(b) || 0) - (docFreqs.get(a) || 0);
      })
      .slice(0, maxFeatures);
  }
  
  const termToIndex = new Map<string, number>();
  vocabulary.forEach((term, index) => {
    termToIndex.set(term, index);
  });
  
  const tfidf = new natural.TfIdf();
  docs.forEach(doc => {
    const features = extractFeatures(doc);
    const filteredFeatures = features.filter(feature => termToIndex.has(feature));
    tfidf.addDocument(filteredFeatures.join(' '));
  });
  
  return { tfidf, vocabulary, termToIndex };
}

export function getTfIdfVector(
  tfidfData: { tfidf: natural.TfIdf; vocabulary: string[]; termToIndex: Map<string, number> },
  text: string,
  docIndex?: number
): number[] {
  const { tfidf, vocabulary, termToIndex } = tfidfData;
  const features = extractFeatures(text);
  
  if (typeof docIndex === 'number') {
    return vocabulary.map(term => tfidf.tfidf(term, docIndex));
  } else {
    const filteredFeatures = features.filter(feature => termToIndex.has(feature));
    tfidf.addDocument(filteredFeatures.join(' '));
    const tempIndex = tfidf.documents.length - 1;
    const vector = vocabulary.map(term => tfidf.tfidf(term, tempIndex));
    tfidf.documents.pop();
    return vector;
  }
}

export function calculateFeatureImportance(
  docs: string[],
  labels: number[][],
  emotionIndex: number
): Map<string, number> {
  const positiveFeatures = new Map<string, number>();
  const negativeFeatures = new Map<string, number>();
  
  docs.forEach((doc, i) => {
    const features = new Set(extractFeatures(doc));
    const isPositive = labels[i][emotionIndex] === 1;
    
    features.forEach(feature => {
      if (isPositive) {
        positiveFeatures.set(feature, (positiveFeatures.get(feature) || 0) + 1);
      } else {
        negativeFeatures.set(feature, (negativeFeatures.get(feature) || 0) + 1);
      }
    });
  });
  
  const importance = new Map<string, number>();
  const allFeatures = new Set([...positiveFeatures.keys(), ...negativeFeatures.keys()]);
  
  allFeatures.forEach(feature => {
    const posCount = positiveFeatures.get(feature) || 0;
    const negCount = negativeFeatures.get(feature) || 0;
    const total = posCount + negCount;
    
    if (total > 0) {
      const score = Math.abs(posCount - negCount) / total;
      importance.set(feature, score);
    }
  });
  
  return importance;
}