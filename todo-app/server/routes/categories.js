// /api/categories 라우터
const express = require('express');
const router = express.Router();
const db = require('../db');

// Promise 래퍼 함수
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// GET /api/categories - 모든 카테고리 조회
router.get('/', async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM categories ORDER BY created_at ASC');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories - 새 카테고리 생성
router.post('/', async (req, res) => {
  try {
    const { name, color = '#667eea' } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: '카테고리 이름을 입력해주세요.' });
    }

    const result = await dbRun(`
      INSERT INTO categories (name, color)
      VALUES (?, ?)
    `, [name.trim(), color]);

    const newCategory = await dbGet('SELECT * FROM categories WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, data: newCategory });
  } catch (err) {
    // UNIQUE 제약 조건 위반
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, error: '이미 존재하는 카테고리입니다.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/categories/:id - 카테고리 수정
router.put('/:id', async (req, res) => {
  try {
    const { name, color } = req.body;

    const existing = await dbGet('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: '카테고리를 찾을 수 없습니다.' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (color !== undefined) updates.color = color;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: '수정할 내용이 없습니다.' });
    }

    const keys = Object.keys(updates);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => updates[k]);

    await dbRun(`UPDATE categories SET ${setClause} WHERE id = ?`, [...values, req.params.id]);

    const updatedCategory = await dbGet('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedCategory });
  } catch (err) {
    // UNIQUE 제약 조건 위반
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, error: '이미 존재하는 카테고리명입니다.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/categories/:id - 카테고리 삭제
router.delete('/:id', async (req, res) => {
  try {
    const category = await dbGet('SELECT * FROM categories WHERE id = ?', [req.params.id]);

    if (!category) {
      return res.status(404).json({ success: false, error: '카테고리를 찾을 수 없습니다.' });
    }

    // 연관된 todos의 category_id를 NULL로 설정
    await dbRun('UPDATE todos SET category_id = NULL WHERE category_id = ?', [req.params.id]);

    // 카테고리 삭제
    await dbRun('DELETE FROM categories WHERE id = ?', [req.params.id]);

    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
