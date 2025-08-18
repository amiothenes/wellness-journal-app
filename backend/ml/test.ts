import { predictEmotions } from './predictSentiment';

// Enhanced test cases with more accurate expected emotions
const testCases = [
  {
    text: "I am depressed and anxious",
    expected: ["Answer.f1.anxious.raw", "Answer.f1.sad.raw"]
  },
  {
    text: "I feel really happy and excited today",
    expected: ["Answer.f1.happy.raw", "Answer.f1.excited.raw"]
  },
  {
    text: "I'm not feeling good at all",
    expected: ["Answer.f1.sad.raw", "Answer.f1.frustrated.raw", "Answer.f1.anxious.raw"]
  },
  {
    text: "This is frustrating and makes me angry",
    expected: ["Answer.f1.frustrated.raw", "Answer.f1.angry.raw"]
  },
  {
    text: "I'm scared and afraid of what might happen",
    expected: ["Answer.f1.afraid.raw", "Answer.f1.anxious.raw"]
  },
  {
    text: "I feel calm and satisfied with my progress",
    expected: ["Answer.f1.calm.raw", "Answer.f1.satisfied.raw"]
  },
  {
    text: "I'm feeling proud of my achievements",
    expected: ["Answer.f1.proud.raw", "Answer.f1.satisfied.raw"]
  },
  {
    text: "I'm disgusted by this behavior", 
    expected: ["Answer.f1.disgusted.raw", "Answer.f1.angry.raw"]
  },
  {
    text: "I feel confused and don't know what to do",
    expected: ["Answer.f1.confused.raw", "Answer.f1.anxious.raw"]
  },
  {
    text: "I'm ashamed of my mistakes",
    expected: ["Answer.f1.ashamed.raw", "Answer.f1.sad.raw"]
  },
  {
    text: "This is so boring I can't stand it",
    expected: ["Answer.f1.bored.raw", "Answer.f1.frustrated.raw"]
  },
  {
    text: "I'm surprised and excited about this news",
    expected: ["Answer.f1.surprised.raw", "Answer.f1.excited.raw"]
  }
];

// IMPROVED evaluation with better metrics
const thresholds = [0.3, 0.4, 0.5];

console.log("=== ENHANCED MODEL ACCURACY EVALUATION ===\n");

let bestF1 = 0;
let bestThreshold = 0;

thresholds.forEach(threshold => {
  console.log(`\n--- THRESHOLD: ${threshold} ---`);
  let totalCorrect = 0;
  let totalPredicted = 0;
  let totalExpected = 0;
  let perfectMatches = 0;
  
  testCases.forEach((testCase, idx) => {
    const predicted = predictEmotions(testCase.text, threshold);
    const correct = predicted.filter(p => testCase.expected.includes(p)).length;
    const isPerfectMatch = correct === testCase.expected.length && predicted.length === testCase.expected.length;
    
    if (isPerfectMatch) perfectMatches++;
    
    totalCorrect += correct;
    totalPredicted += predicted.length;
    totalExpected += testCase.expected.length;
    
    // Only show details for problematic cases
    if (correct === 0 || predicted.length === 0) {
      console.log(`❌ FAILED - Test ${idx + 1}: "${testCase.text}"`);
      console.log(`   Expected: ${testCase.expected.join(', ')}`);
      console.log(`   Predicted: ${predicted.join(', ') || 'NONE'}`);
      console.log(`   Correct: ${correct}/${testCase.expected.length}\n`);
    } else if (correct < testCase.expected.length) {
      console.log(`⚠️  PARTIAL - Test ${idx + 1}: "${testCase.text}"`);
      console.log(`   Expected: ${testCase.expected.join(', ')}`);
      console.log(`   Predicted: ${predicted.join(', ')}`);
      console.log(`   Correct: ${correct}/${testCase.expected.length}\n`);
    } else {
      console.log(`✅ GOOD - Test ${idx + 1}: ${correct}/${testCase.expected.length} correct`);
    }
  });
  
  const precision = totalPredicted > 0 ? totalCorrect / totalPredicted : 0;
  const recall = totalExpected > 0 ? totalCorrect / totalExpected : 0;
  const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
  const accuracy = perfectMatches / testCases.length;
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Perfect Matches: ${perfectMatches}/${testCases.length} (${(accuracy * 100).toFixed(1)}%)`);
  console.log(`   Precision: ${precision.toFixed(3)} (${(precision * 100).toFixed(1)}%)`);
  console.log(`   Recall: ${recall.toFixed(3)} (${(recall * 100).toFixed(1)}%)`);
  console.log(`   F1 Score: ${f1.toFixed(3)}`);
  
  if (f1 > bestF1) {
    bestF1 = f1;
    bestThreshold = threshold;
  }
});

console.log(`\n🎯 BEST PERFORMANCE: Threshold ${bestThreshold} with F1 Score ${bestF1.toFixed(3)}`);

// Test specific negation cases
console.log(`\n=== NEGATION HANDLING TEST ===`);
const negationTests = [
  "I'm not happy",
  "I don't feel good", 
  "I'm not feeling well",
  "This is not good at all",
  "I'm not excited about this"
];

negationTests.forEach(text => {
  const predicted = predictEmotions(text, bestThreshold);
  const hasNegativeEmotion = predicted.some(p => 
    ["Answer.f1.sad.raw", "Answer.f1.frustrated.raw", "Answer.f1.anxious.raw", 
     "Answer.f1.angry.raw", "Answer.f1.afraid.raw"].includes(p)
  );
  
  console.log(`"${text}"`);
  console.log(`  Predicted: ${predicted.join(', ') || 'NONE'}`);
  console.log(`  Negative detected: ${hasNegativeEmotion ? '✅' : '❌'}\n`);
});