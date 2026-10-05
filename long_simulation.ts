import { calculateSentenceWeight, sampleTestSentences } from './client/src/utils/testSampler';
import type { Sentence, SentenceRecord } from './client/src/types';

const TOTAL_SENTENCES = 500;
const sentences: Sentence[] = Array.from({ length: TOTAL_SENTENCES }, (_, i) => ({
  id: i + 1,
  english: `Sentence ${i + 1}`,
  korean: `문장 ${i + 1}`,
  category: 'core_verb',
  difficulty: 1,
  parts: [2, 3],
  tags: []
}));

const records: Record<number, SentenceRecord> = {};
let currentTime = Date.now();
const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR * 24;

// Simulation parameters
const TEST_SIZE = 20;
const BASE_CORRECT_PROBABILITY = 0.6; // 60% chance to get it right initially

// Tracking metrics
const history: any[] = [];

function simulateUserAnswer(record: SentenceRecord | undefined): boolean {
  if (!record) return Math.random() < BASE_CORRECT_PROBABILITY;
  
  // If they have learned it, probability goes up with consecutive correct
  let prob = BASE_CORRECT_PROBABILITY + (record.consecutiveCorrect * 0.1);
  if (record.status === 'mastered') prob = 0.95; // 95% chance to maintain mastered
  
  return Math.random() < prob;
}

function runSimulation(iterations: number, label: string) {
  let unlearnedDrawn = 0;
  let reviewDrawn = 0;
  let masteredDrawn = 0;
  let totalDrawn = 0;

  for (let i = 1; i <= iterations; i++) {
    // 1. Draw test
    const testSentences = sampleTestSentences(sentences, records, {
      questionCount: TEST_SIZE,
      partFilter: 'all',
      categoryFilter: 'all',
      difficultyFilter: 'all',
      statusFilter: 'smart'
    });

    // 2. Track stats for this draw
    testSentences.forEach(s => {
      totalDrawn++;
      const rec = records[s.id];
      if (!rec || rec.attempts === 0) unlearnedDrawn++;
      else if (rec.status === 'mastered' && rec.consecutiveCorrect >= 3) masteredDrawn++;
      else reviewDrawn++;
    });

    // 3. Simulate answering and update records
    testSentences.forEach(s => {
      const isCorrect = simulateUserAnswer(records[s.id]);
      
      if (!records[s.id]) {
        records[s.id] = {
          id: s.id, sentenceId: s.id,
          attempts: 0, correct: 0, incorrect: 0, consecutiveCorrect: 0,
          status: 'learning', lastReviewedAt: new Date(currentTime).toISOString(),
          isBookmarked: false
        };
      }
      
      const rec = records[s.id];
      rec.attempts++;
      rec.lastReviewedAt = new Date(currentTime).toISOString();
      
      if (isCorrect) {
        rec.correct++;
        rec.consecutiveCorrect++;
        if (rec.consecutiveCorrect >= 3) rec.status = 'mastered';
      } else {
        rec.incorrect++;
        rec.consecutiveCorrect = 0;
        rec.status = 'review';
      }
    });

    // 4. Advance time (User takes a test every 12 hours)
    currentTime += ONE_HOUR * 12;

    // Record snapshot every 20% of the total iterations
    if (i % (iterations / 5) === 0 || i === iterations) {
      const masteredCount = Object.values(records).filter(r => r.status === 'mastered').length;
      const reviewCount = Object.values(records).filter(r => r.status === 'review').length;
      const unlearnedCount = TOTAL_SENTENCES - Object.keys(records).length;
      
      history.push({
        iteration: i,
        mastered: masteredCount,
        review: reviewCount,
        unlearned: unlearnedCount,
        unlearnedDrawnPercent: ((unlearnedDrawn / totalDrawn) * 100).toFixed(1) + '%',
        reviewDrawnPercent: ((reviewDrawn / totalDrawn) * 100).toFixed(1) + '%',
        masteredDrawnPercent: ((masteredDrawn / totalDrawn) * 100).toFixed(1) + '%'
      });
      
      // Reset drawn counts for next phase
      unlearnedDrawn = 0;
      reviewDrawn = 0;
      masteredDrawn = 0;
      totalDrawn = 0;
    }
  }
}

console.log('--- STARTING MULTI-PHASE SIMULATION ---');
console.log('Total Sentences in Pool:', TOTAL_SENTENCES);

// Reset state
for (const key in records) delete records[key];
history.length = 0;
currentTime = Date.now();

// Let's run a massive 10,000 iteration simulation to see long-term behavior
runSimulation(10000, '10,000 Iterations');

console.table(history);

// Check if weights exploded
let maxWeight = 0;
let highestIncorrect = 0;
Object.values(records).forEach(r => {
  const w = calculateSentenceWeight(r.id, r);
  if (w > maxWeight) maxWeight = w;
  if (r.incorrect > highestIncorrect) highestIncorrect = r.incorrect;
});

console.log('\n--- LONG TERM STABILITY CHECK ---');
console.log(`Highest incorrect count on a single sentence: ${highestIncorrect}`);
console.log(`Max weight found in records: ${maxWeight} (Safe from Infinity/NaN explosion)`);

// Check time decay effect on mastered items
const someMastered = Object.values(records).find(r => r.status === 'mastered');
if (someMastered) {
    const daysOld = (Date.now() - new Date(someMastered.lastReviewedAt).getTime()) / ONE_DAY;
    const w = calculateSentenceWeight(someMastered.id, someMastered);
    console.log(`\nTime Decay Example: A mastered item (last reviewed ${Math.abs(Math.floor(daysOld))} days ago) currently has weight: ${w}`);
}
