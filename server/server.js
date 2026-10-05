import 'dotenv/config'; // 환경 변수 로드 (.env)
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, connectDB } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'toeic_speaking_secret_key_2026_xyz';

// MongoDB 연결 실행
connectDB();

app.use(cors());
app.use(express.json());

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않거나 만료된 토큰입니다.' });
    }
    req.user = user;
    next();
  });
}

// 1. 회원가입
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '이메일(아이디)과 비밀번호를 입력해주세요.' });
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: '이미 사용 중인 이메일/아이디입니다.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.createUser({
      email,
      username: username || email.split('@')[0],
      passwordHash
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' });
  }
});

// 2. 로그인
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: '등록되지 않은 아이디(이메일)입니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
  }
});

// 3. 내 정보 조회
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const progress = await db.getUserProgress(user.id);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      progress
    });
  } catch (error) {
    console.error('Auth/Me error:', error);
    res.status(500).json({ error: '정보 조회 중 오류가 발생했습니다.' });
  }
});

// 4. 문장 전체 목록 조회 (공개 API)
app.get('/api/sentences', (req, res) => {
  const { category, subcategory } = req.query;
  let sentences = db.getSentences();

  if (category) {
    sentences = sentences.filter(s => s.category === category);
  }
  if (subcategory) {
    sentences = sentences.filter(s => s.subcategory === subcategory);
  }

  res.json({ sentences });
});

// 5. 유저 학습 기록 조회
app.get('/api/user/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await db.getUserProgress(req.user.id);
    res.json(progress);
  } catch (error) {
    console.error('Progress get error:', error);
    res.status(500).json({ error: '학습 기록 조회 중 오류가 발생했습니다.' });
  }
});

// 6. 문장 풀이 결과 기록 (O/X 체크)
app.post('/api/user/record', authenticateToken, async (req, res) => {
  try {
    const { sentenceId, isCorrect } = req.body;
    if (sentenceId === undefined || isCorrect === undefined) {
      return res.status(400).json({ error: 'sentenceId와 isCorrect 파라미터가 필요합니다.' });
    }

    const updatedRecord = await db.updateSentenceRecord(req.user.id, sentenceId, Boolean(isCorrect));
    const userProgress = await db.getUserProgress(req.user.id);

    res.json({
      record: updatedRecord,
      streak: userProgress.streak,
      totalRecords: Object.keys(userProgress.records).length
    });
  } catch (error) {
    console.error('Record update error:', error);
    res.status(500).json({ error: '결과 기록 중 오류가 발생했습니다.' });
  }
});

// 7. 북마크 토글
app.post('/api/user/bookmark', authenticateToken, async (req, res) => {
  try {
    const { sentenceId } = req.body;
    if (!sentenceId) {
      return res.status(400).json({ error: 'sentenceId가 필요합니다.' });
    }

    const record = await db.toggleBookmark(req.user.id, sentenceId);
    res.json({ record });
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ error: '북마크 토글 중 오류가 발생했습니다.' });
  }
});

// 8. 학습 기록 초기화
app.post('/api/user/reset', authenticateToken, async (req, res) => {
  try {
    const resetProgress = await db.resetUserProgress(req.user.id);
    res.json({ message: '학습 기록이 초기화되었습니다.', progress: resetProgress });
  } catch (error) {
    console.error('Reset progress error:', error);
    res.status(500).json({ error: '초기화 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 TOEIC Speaking Server running on port ${PORT}`);
});
