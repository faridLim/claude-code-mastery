// SQLite 데이터베이스 연결 및 초기화
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// DB 파일 경로
const dbPath = path.join(__dirname, '../data/todos.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DB 연결 오류:', err);
  } else {
    console.log('✓ SQLite DB 연결 성공');
    initializeDatabase();
  }
});

// 테이블 자동 생성
function initializeDatabase() {
  // categories 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#667eea',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // todos 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
      category_id INTEGER,
      recurrence TEXT DEFAULT 'none' CHECK(recurrence IN ('none', 'daily', 'weekly', 'monthly')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);
}

module.exports = db;
