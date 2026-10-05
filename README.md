# 🎙️ 스픽토스 (SpeakTOS) - 토익스피킹 실전 문장 암기 웹/앱

> **토익스피킹 빈출 필수 표현을 한글 뜻을 보고 직접 영어로 소리 내어 말하며 외우는 반응형 스피킹 훈련 앱**

---

## 🌟 주요 기능

1. **자가진단 플래시카드 훈련**
   - **한글 뜻 제시** → **영어로 소리 내어 발화** → **[정답 확인] 클릭** → **사용자가 직접 [맞음(O) / 틀림(X)] 체크**
   - 정답 확인 시 **미국식 원어민 TTS(Text-to-Speech) 음성 자동 재생** 및 속도 조절(0.8x, 1.0x, 1.2x) 지원.
   - 마이크 음성인식(STT) 보조 모드 지원 (내가 말한 영어 문장을 실시간 텍스트로 확인).
   - 실전 시험 긴장감을 위한 **5초/10초 카운트다운 타이머 모드**.

2. **아이디 기반 로그인 및 클라우드 동기화**
   - 아이디/이메일 및 비밀번호로 간편 가입 & 로그인.
   - PC와 스마트폰(모바일) 어디서든 동일한 계정으로 로그인 시 학습 기록, 오답노트, 북마크 완벽 동기화.
   - 비회원도 즉시 학습 가능한 **게스트(오프라인) 모드** 기본 제공.

3. **취약점 집중 정복 (오답노트 & 북마크)**
   - 틀린 문장(X)은 자동으로 오답노트에 기록.
   - `[오답 문장만 집중 스피킹 훈련하기]` 원클릭으로 취약한 문장만 무한 반복 연습.
   - 다시 보고 싶은 문장은 별표(⭐) 북마크로 보관.

4. **모바일 퍼스트 반응형 UI & PWA 지원**
   - 스마트폰 화면비(390px~520px)에 최적화된 터치/스와이프 친화적 디자인.
   - 사파리/크롬에서 `홈 화면에 추가` 시 앱스토어 어플처럼 전체화면으로 구동.

5. **첨부파일 기반 엄선된 144개 실전 문장 내장**
   - **기본동사구 (Core Verbs)**: `take`, `get`, `do`, `go`, `make`, `have` (파트 2~5 필수)
   - **빈출주제별 문장 (Topics)**: 직장(`work`), 학교(`school`), 기술(`technology`), 쇼핑(`shopping`), 주거(`housing`), 트렌드(`trend`), 여행(`travel`), 환경(`environment`)
   - **만능 핵심구문 (Key Patterns)**: `can + V`, `It is ~ to`, `There is/are`, `need to / should`, `don't have to`, `be interested in`, `like + ~ing`
   - **고득점 형용사/부사**: `reasonable`, `convenient`, `crowded`, `efficiently`, `sincerely` 등

---

## 🚀 빠른 시작 가이드 (실행 방법)

### 1. 개발 서버 실행
루트 폴더(`c:\Users\pdwro\My_Project`)에서 아래 명령어를 실행하면 **백엔드 API 서버(5000)**와 **프론트엔드 웹앱(5173)**이 동시에 실행됩니다.

```bash
npm run dev
```

- 웹 브라우저 주소: `http://localhost:5173`
- 백엔드 API 주소: `http://localhost:5000`

---

## 📱 스마트폰(모바일)에서 접속하는 방법

같은 와이파이(Wi-Fi)에 연결된 스마트폰에서 PC의 IP 주소로 바로 접속하여 실제 어플처럼 학습할 수 있습니다.

1. PC의 IP 주소를 확인합니다 (Windows 터미널에서 `ipconfig` 실행, 예: `192.168.0.15`).
2. 클라이언트 실행 시 호스트 개방:
   ```bash
   npm run dev --prefix client -- --host
   ```
3. 스마트폰 모바일 브라우저(크롬 또는 사파리)를 열고 `http://<PC의 IP주소>:5173`으로 접속합니다.
4. 브라우저 설정 메뉴에서 **[홈 화면에 추가]**를 누르면 앱 아이콘이 생성되어 독립 앱처럼 사용하실 수 있습니다.

---

## 📂 프로젝트 구조

```
My_Project/
├── client/                     # 프론트엔드 (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/         # StudyView, NotebookView, AllSentencesView, StatsView, AuthModal 등
│   │   ├── utils/              # api.ts (동기화), speech.ts (TTS/STT)
│   │   ├── types.ts            # 타입 정의
│   │   ├── index.css           # 모바일 최적화 글래스모피즘 디자인 시스템
│   │   └── App.tsx             # 앱 메인 뷰 및 라우팅
│   └── vite.config.ts          # 프록시 설정 (/api -> localhost:5000)
├── server/                     # 백엔드 (Node.js + Express)
│   ├── data/                   # JSON 기반 영속 스토리지 (sentences.json, users.json, progress.json)
│   ├── db.js                   # 사용자 및 학습 기록 관리 계층
│   └── server.js               # JWT 인증 및 REST API 서버
├── package.json                # 루트 통합 실행 스크립트
└── README.md                   # 프로젝트 설명서
```
