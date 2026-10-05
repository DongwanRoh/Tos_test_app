import { calculateSentenceWeight, sampleTestSentences } from './client/src/utils/testSampler';
import type { Sentence, SentenceRecord } from './client/src/types';

// Mock data
const sentences: Sentence[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  english: `Sentence ${i + 1}`,
  korean: `문장 ${i + 1}`,
  category: 'core_verb',
  difficulty: 1,
  parts: [2, 3],
  tags: []
}));

const records: Record<number, SentenceRecord> = {};
const NOW = Date.now();
const ONE_DAY = 1000 * 60 * 60 * 24;

// 1. Setup Mock Records
for (let i = 1; i <= 100; i++) {
  if (i <= 10) {
    // 1-10: Review pool (incorrect answers)
    records[i] = {
      id: i, sentenceId: i, attempts: 2, correct: 1, incorrect: 1,
      consecutiveCorrect: 0, status: 'learning', lastReviewedAt: new Date(NOW - ONE_DAY).toISOString(),
      isBookmarked: false
    };
  } else if (i <= 20) {
    // 11-20: Review pool (explicitly marked for review)
    records[i] = {
      id: i, sentenceId: i, attempts: 3, correct: 2, incorrect: 0,
      consecutiveCorrect: 2, status: 'review', lastReviewedAt: new Date(NOW - ONE_DAY).toISOString(),
      isBookmarked: false
    };
  } else if (i <= 30) {
    // 21-30: Mastered but very old (Time decay test)
    records[i] = {
      id: i, sentenceId: i, attempts: 5, correct: 5, incorrect: 0,
      consecutiveCorrect: 5, status: 'mastered', lastReviewedAt: new Date(NOW - ONE_DAY * 30).toISOString(), // 30 days old => +300 weight
      isBookmarked: false
    };
  } else if (i <= 40) {
    // 31-40: Bookmarked Unlearned vs Unbookmarked Unlearned
    // 31-35: Bookmarked, 36-40: Unbookmarked
    if (i <= 35) {
      records[i] = { id: i, sentenceId: i, attempts: 0, correct: 0, incorrect: 0, consecutiveCorrect: 0, status: 'unlearned', lastReviewedAt: '', isBookmarked: true };
    }
  } else if (i <= 50) {
    // 41-50: High incorrect cap test (incorrect: 10)
    records[i] = {
      id: i, sentenceId: i, attempts: 10, correct: 0, incorrect: 10,
      consecutiveCorrect: 0, status: 'learning', lastReviewedAt: new Date(NOW).toISOString(),
      isBookmarked: false
    };
  }
}

// Ensure 36-40 are unlearned without explicit record or attempts = 0 (handled by not being in records or having attempts=0)

// Test 1: Weight Calculation Validations
console.log('--- TEST 1: Weight Calculations ---');
console.log('Unlearned (No Record):', calculateSentenceWeight(99)); // Expected: 120
console.log('Unlearned (Bookmarked):', calculateSentenceWeight(31, records[31])); // Expected: 145 (120 + 25)
console.log('Mastered (Recent):', calculateSentenceWeight(21, { ...records[21], lastReviewedAt: new Date(NOW).toISOString() })); // Expected: 5
console.log('Mastered (30 days old):', calculateSentenceWeight(21, records[21])); // Expected: 5 + 300 = 305
console.log('Review marked:', calculateSentenceWeight(11, records[11])); // Expected: base 100 - (2*30) + 50 + 10 (decay) = 100
console.log('High Incorrect (Capped at 4):', calculateSentenceWeight(41, records[41])); // Expected: base 100 + (4*35) = 240
console.log('High Incorrect (Bookmarked):', calculateSentenceWeight(41, { ...records[41], isBookmarked: true })); // Expected: 265

// Test 2: Smart Mode Quota Simulation (Run 100 times)
console.log('\n--- TEST 2: Smart Mode Quota (20 questions) over 100 iterations ---');
let totalReviewPoolSelected = 0;
for (let i = 0; i < 100; i++) {
  const result = sampleTestSentences(sentences, records, {
    questionCount: 20,
    partFilter: 'all',
    categoryFilter: 'all',
    difficultyFilter: 'all',
    statusFilter: 'smart'
  });
  
  // Count how many are from review pool (ids 1-20 or 41-50 which have incorrect > 0)
  const reviewSelected = result.filter(s => {
    const rec = records[s.id];
    return rec && (rec.incorrect > 0 || rec.status === 'review');
  });
  totalReviewPoolSelected += reviewSelected.length;
}

console.log(`Average review pool items per test (Target 40% of 20 = 8): ${totalReviewPoolSelected / 100}`);

// Test 3: Unlearned Bookmarked vs Unbookmarked
console.log('\n--- TEST 3: Unlearned Bookmark Priority (1000 selections of 1 question) ---');
let bookmarkedSelected = 0;
let unbookmarkedSelected = 0;
for (let i = 0; i < 1000; i++) {
  const result = sampleTestSentences(sentences.filter(s => s.id >= 31 && s.id <= 40), records, {
    questionCount: 1,
    partFilter: 'all',
    categoryFilter: 'all',
    difficultyFilter: 'all',
    statusFilter: 'smart' // Uses weights
  });
  if (result[0].id <= 35) {
    bookmarkedSelected++;
  } else {
    unbookmarkedSelected++;
  }
}
console.log(`Bookmarked selected (ids 31-35): ${bookmarkedSelected} times (${(bookmarkedSelected/1000*100).toFixed(1)}%)`);
console.log(`Unbookmarked selected (ids 36-40): ${unbookmarkedSelected} times (${(unbookmarkedSelected/1000*100).toFixed(1)}%)`);
console.log(`Expected ratio approx: 145 / (145 + 120) = 54.7%`);

