// Express 서버 진입점
const express = require('express');
const path = require('path');
const db = require('./db');
const errorHandler = require('./middleware/errorHandler');
const todoRoutes = require('./routes/todos');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API 라우터
app.use('/api/todos', todoRoutes);
app.use('/api/categories', categoryRoutes);

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// 정적 HTML 서빙 (SPA 라우팅 지원)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 에러 처리 미들웨어
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`✓ Todo App 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`  브라우저에서 http://localhost:${PORT} 를 열어주세요.`);
});
