import type { Sentence, SentenceRecord, TestOptions } from '../types';

/**
 * Calculates a sampling weight for a sentence based on user learning records.
 * Lower weight = less likely to appear (frequently answered correctly).
 * Higher weight = more likely to appear (wrong answers, unlearned).
 */
export function calculateSentenceWeight(
  _sentenceId: number,
  record?: SentenceRecord
): number {
  if (!record || record.attempts === 0) {
    // Unlearned: high priority to explore new content
    let weight = 120;
    if (record?.isBookmarked) weight += 25;
    return weight;
  }

  const { incorrect, consecutiveCorrect, status, lastReviewedAt } = record;

  // Heavily penalize mastered / consecutively correct items
  let baseWeight = 100;
  if (status === 'mastered' || consecutiveCorrect >= 3) {
    baseWeight = 5; // Minimal chance to appear
  }

  let weight = baseWeight;

  // Boost for incorrect answers (high review urgency), capped at 4
  if (incorrect > 0) {
    weight += Math.min(incorrect, 4) * 35;
  }

  // Reduce for consecutive correct streaks
  weight -= consecutiveCorrect * 30;

  // Ensure strictly positive weight before time decay and bookmark bonus
  weight = Math.max(weight, 5);

  // Time decay (forgetting curve) based on lastReviewedAt
  if (lastReviewedAt) {
    const daysSince = (Date.now() - new Date(lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 0) {
      weight += Math.floor(daysSince) * 10; // +10 weight per day
    }
  }

  // Extra boost if status is explicitly marked for review
  if (status === 'review') {
    weight += 50;
  }

  // Boost for bookmarked items applied to all
  if (record.isBookmarked) {
    weight += 25;
  }

  return weight;
}

/**
 * Filter sentences according to user-selected options and sample N items
 * using weighted random sampling without replacement (Efraimidis & Spirakis algorithm).
 */
export function sampleTestSentences(
  allSentences: Sentence[],
  records: Record<number, SentenceRecord>,
  options: TestOptions
): Sentence[] {
  // 1. Filter candidates
  let candidates = allSentences.filter((s) => {
    // Part filter
    if (options.partFilter !== 'all') {
      if (!s.parts || !s.parts.includes(options.partFilter as number)) {
        return false;
      }
    }

    // Category filter
    if (options.categoryFilter !== 'all' && s.category !== options.categoryFilter) {
      return false;
    }

    // Difficulty filter
    if (options.difficultyFilter !== 'all' && s.difficulty !== options.difficultyFilter) {
      return false;
    }

    // Status filter
    const rec = records[s.id];
    if (options.statusFilter === 'unlearned') {
      return !rec || rec.attempts === 0;
    }
    if (options.statusFilter === 'wrong') {
      return rec && (rec.incorrect > 0 || rec.status === 'review');
    }
    if (options.statusFilter === 'bookmarked') {
      return rec && rec.isBookmarked;
    }

    return true;
  });

  if (candidates.length === 0) {
    return [];
  }

  const count = Math.min(options.questionCount, candidates.length);
  let finalSelected: Sentence[] = [];

  if (options.statusFilter === 'smart') {
    // Quota for review pool: 40%
    const quota = Math.floor(count * 0.4);
    
    // Separate candidates into review pool
    const reviewPool = candidates.filter(s => {
      const rec = records[s.id];
      return rec && (rec.incorrect > 0 || rec.status === 'review');
    });
    
    const reviewCount = Math.min(quota, reviewPool.length);
    
    // Sample from review pool using A-ExpJ (Efraimidis-Spirakis)
    const reviewScored = reviewPool.map((sentence) => {
      const rec = records[sentence.id];
      const weight = calculateSentenceWeight(sentence.id, rec);
      const u = Math.random();
      const score = Math.log(Math.max(u, 1e-10)) / weight;
      return { sentence, score };
    });
    
    reviewScored.sort((a, b) => b.score - a.score);
    const selectedFromReview = reviewScored.slice(0, reviewCount).map(i => i.sentence);
    
    finalSelected.push(...selectedFromReview);
    
    // Remaining candidates
    const remainingCount = count - finalSelected.length;
    const selectedIds = new Set(finalSelected.map(s => s.id));
    const remainingCandidates = candidates.filter(s => !selectedIds.has(s.id));
    
    // Sample remaining
    const remainingScored = remainingCandidates.map((sentence) => {
      const rec = records[sentence.id];
      const weight = calculateSentenceWeight(sentence.id, rec);
      const u = Math.random();
      const score = Math.log(Math.max(u, 1e-10)) / weight;
      return { sentence, score };
    });
    
    remainingScored.sort((a, b) => b.score - a.score);
    const selectedFromRemaining = remainingScored.slice(0, remainingCount).map(i => i.sentence);
    
    finalSelected.push(...selectedFromRemaining);
    
    // Shuffle the final selected array so review items aren't always first
    for (let i = finalSelected.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalSelected[i], finalSelected[j]] = [finalSelected[j], finalSelected[i]];
    }
  } else {
    // 2. Weighted Random Sampling (A-ExpJ / Efraimidis-Spirakis) for other modes
    const scored = candidates.map((sentence) => {
      const rec = records[sentence.id];
      const weight =
        options.statusFilter === 'all'
          ? 100 // Flat uniform random
          : calculateSentenceWeight(sentence.id, rec);

      const u = Math.random();
      const score = Math.log(Math.max(u, 1e-10)) / weight;

      return { sentence, score };
    });

    // Sort descending by score (less negative is higher score)
    scored.sort((a, b) => b.score - a.score);

    finalSelected = scored.slice(0, count).map((item) => item.sentence);
  }

  return finalSelected;
}
