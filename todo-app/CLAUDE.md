# CLAUDE.md

Todo App 개발 가이드입니다.

## 언어 및 커뮤니케이션 규칙

- **기본 응답 언어**: 한국어로 진행
- **코드 주석**: 한국어로 작성
- **커밋 메시지**: 한국어로 작성
- **문서화**: 한국어로 작성
- **변수명/함수명**: 영어 사용 (코드 표준 준수)

## 프로젝트 개요

풀스택 Todo App: Node.js + Express + SQLite 백엔드, Vanilla JS 프론트엔드

**기술 스택**
- 백엔드: Express.js, better-sqlite3
- 프론트엔드: Vanilla JS, Tailwind CSS (CDN)
- 데이터베이스: SQLite

## 빌드 및 실행

```bash
# 설치
npm install

# 개발 서버 실행 (자동 재시작)
npm run dev

# 프로덕션 실행
npm start

# 접속 주소
http://localhost:3000
```

## 프로젝트 구조

```
todo-app/
├── server/                    # 백엔드
│   ├── index.js              # Express 앱 진입점
│   ├── db.js                 # SQLite 연결 및 초기화
│   ├── routes/
│   │   ├── todos.js          # /api/todos 라우터
│   │   └── categories.js     # /api/categories 라우터
│   └── middleware/
│       └── errorHandler.js   # 에러 처리 미들웨어
├── public/                   # 프론트엔드 정적 파일
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── api.js            # REST API 통신 모듈
│       ├── render.js         # HTML 템플릿 생성
│       └── app.js            # UI 컨트롤러
├── data/
│   └── todos.db              # SQLite DB (자동 생성)
├── package.json
└── .gitignore
```

## 아키텍처

**데이터 흐름**

```
사용자 액션 → app.js → api.js fetch() → Express 라우터
→ db.js SQLite 쿼리 → 응답 JSON → render.js → DOM 업데이트
```

**모듈 역할**

- `server/db.js`: LocalStorage 대신 SQLite 사용
- `public/js/api.js`: bucket-list의 storage.js를 fetch()로 대체
- `public/js/render.js`: HTML 템플릿 함수 (우선순위/카테고리/반복 배지)
- `public/js/app.js`: BucketListApp 패턴 계승

## REST API

### Todos
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/todos?filter=&priority=&category_id=` | 목록 조회 |
| POST | `/api/todos` | 새 Todo 생성 |
| PUT | `/api/todos/:id` | 수정 |
| PATCH | `/api/todos/:id/toggle` | 완료 토글 |
| DELETE | `/api/todos/:id` | 삭제 |

### Categories
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/categories` | 전체 조회 |
| POST | `/api/categories` | 생성 |
| PUT | `/api/categories/:id` | 수정 |
| DELETE | `/api/categories/:id` | 삭제 |

## DB 스키마

### todos 테이블
- id (INTEGER PRIMARY KEY)
- title (TEXT NOT NULL)
- completed (INTEGER DEFAULT 0)
- priority (TEXT DEFAULT 'medium')
- category_id (INTEGER FK)
- recurrence (TEXT DEFAULT 'none')
- created_at, completed_at, updated_at (TEXT ISO8601)

### categories 테이블
- id (INTEGER PRIMARY KEY)
- name (TEXT NOT NULL UNIQUE)
- color (TEXT)
- created_at (TEXT ISO8601)

## 개발 가이드라인

### 코드 스타일
- 변수, 함수, 클래스명은 영어
- 주석과 문서는 한국어
- 2-space 들여쓰기 (bucket-list와 동일)

### 주의사항
- `data/todos.db`는 .gitignore에 포함 (자동 생성됨)
- 카테고리 동적 색상은 인라인 스타일 사용 (Tailwind 동적 클래스 불가)
- `escapeHtml()` 패턴으로 XSS 방지
- `better-sqlite3`는 동기 API 사용 (async/await 불필요)

---

**마지막 업데이트**: 2026-04-12
