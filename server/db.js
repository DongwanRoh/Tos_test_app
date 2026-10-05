import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SENTENCES_FILE = path.join(__dirname, 'data', 'sentences.json');

// Mongoose Connection
export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn('⚠️  MONGO_URI가 설정되지 않았습니다. .env 파일을 확인해주세요.');
      return;
    }
    await mongoose.connect(uri);
    console.log('✅ MongoDB Atlas 연결 성공!');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: String,
  passwordHash: String,
  createdAt: { type: Date, default: Date.now }
});

// JSON 변환 시 _id를 id로 변경
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});
const User = mongoose.model('User', userSchema);

const recordSchema = new mongoose.Schema({
  sentenceId: Number,
  attempts: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 },
  consecutiveCorrect: { type: Number, default: 0 },
  isBookmarked: { type: Boolean, default: false },
  lastReviewedAt: Date,
  status: { type: String, default: 'learning' }
});

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  records: {
    type: Map,
    of: recordSchema,
    default: {}
  },
  streak: { type: Number, default: 0 },
  lastStudyDate: String
});
const Progress = mongoose.model('Progress', progressSchema);

export const db = {
  getSentences() {
    try {
      if (!fs.existsSync(SENTENCES_FILE)) return [];
      const data = fs.readFileSync(SENTENCES_FILE, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (err) {
      console.error('Error reading sentences:', err);
      return [];
    }
  },
  
  async findUserByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  },
  
  async findUserById(id) {
    return await User.findById(id);
  },
  
  async createUser(userData) {
    const newUser = new User({
      email: userData.email.trim().toLowerCase(),
      username: userData.username ? userData.username.trim() : userData.email.split('@')[0],
      passwordHash: userData.passwordHash,
    });
    await newUser.save();
    return newUser;
  },

  async getUserProgress(userId) {
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId, records: {}, streak: 0, lastStudyDate: null });
      await progress.save();
    }
    
    // 일반 객체 형태로 변환하여 반환 (기존 코드 호환성을 위해)
    const recordsObj = {};
    if (progress.records) {
      for (const [key, value] of progress.records.entries()) {
        recordsObj[key] = value.toObject();
      }
    }
    return { records: recordsObj, streak: progress.streak, lastStudyDate: progress.lastStudyDate };
  },

  async updateSentenceRecord(userId, sentenceId, isCorrect) {
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId, records: {}, streak: 0, lastStudyDate: null });
    }

    const today = new Date().toISOString().split('T')[0];

    // 연속 학습(Streak) 계산
    if (progress.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (progress.lastStudyDate === yesterday) {
        progress.streak = (progress.streak || 0) + 1;
      } else {
        progress.streak = 1;
      }
      progress.lastStudyDate = today;
    }

    const sId = String(sentenceId);
    let prev = progress.records.get(sId);
    
    if (!prev) {
      prev = {
        sentenceId: Number(sentenceId),
        attempts: 0,
        correct: 0,
        incorrect: 0,
        consecutiveCorrect: 0,
        isBookmarked: false,
        lastReviewedAt: null,
        status: 'learning'
      };
    } else {
      prev = prev.toObject();
    }

    prev.attempts += 1;
    prev.lastReviewedAt = new Date();

    if (isCorrect) {
      prev.correct += 1;
      prev.consecutiveCorrect += 1;
      if (prev.consecutiveCorrect >= 2) {
        prev.status = 'mastered';
      }
    } else {
      prev.incorrect += 1;
      prev.consecutiveCorrect = 0;
      prev.status = 'review';
    }

    progress.records.set(sId, prev);
    await progress.save();

    return progress.records.get(sId);
  },

  async toggleBookmark(userId, sentenceId) {
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId, records: {}, streak: 0, lastStudyDate: null });
    }

    const sId = String(sentenceId);
    let record = progress.records.get(sId);
    
    if (!record) {
      record = {
        sentenceId: Number(sentenceId),
        attempts: 0,
        correct: 0,
        incorrect: 0,
        consecutiveCorrect: 0,
        isBookmarked: true,
        lastReviewedAt: null,
        status: 'learning'
      };
    } else {
      record = record.toObject();
      record.isBookmarked = !record.isBookmarked;
    }

    progress.records.set(sId, record);
    await progress.save();

    return progress.records.get(sId);
  },

  async resetUserProgress(userId) {
    const progress = await Progress.findOne({ userId });
    if (progress) {
      progress.records = new Map();
      progress.streak = 0;
      progress.lastStudyDate = null;
      await progress.save();
    }
    return { records: {}, streak: 0, lastStudyDate: null };
  }
};
