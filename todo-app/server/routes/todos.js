// /api/todos 라우터
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

// GET /api/todos - Todo 목록 조회 (필터링)
router.get('/', async (req, res) => {
  try {
    const { filter = 'all', priority, category_id } = req.query;

    let query = 'SELECT * FROM todos WHERE 1=1';
    const params = [];

    // filter: all, active, completed
    if (filter === 'active') {
      query += ' AND completed = 0';
    } else if (filter === 'completed') {
      query += ' AND completed = 1';
    }

    // priority 필터
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    // category 필터
    if (category_id) {
      query += ' AND category_id = ?';
      params.push(parseInt(category_id));
    }

    query += ' ORDER BY created_at DESC';

    const todos = await dbAll(query, params);
    res.json({ success: true, data: todos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/todos/:id - 특정 Todo 조회
router.get('/:id', async (req, res) => {
  try {
    const todo = await dbGet('SELECT * FROM todos WHERE id = ?', [req.params.id]);

    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo를 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: todo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/todos - 새 Todo 생성
router.post('/', async (req, res) => {
  try {
    const { title, priority = 'medium', category_id, recurrence = 'none' } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, error: '제목을 입력해주세요.' });
    }

    const result = await dbRun(`
      INSERT INTO todos (title, priority, category_id, recurrence)
      VALUES (?, ?, ?, ?)
    `, [title.trim(), priority, category_id || null, recurrence]);

    const newTodo = await dbGet('SELECT * FROM todos WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, data: newTodo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/todos/:id - Todo 수정
router.put('/:id', async (req, res) => {
  try {
    const { title, priority, category_id, recurrence, completed } = req.body;

    const existing = await dbGet('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Todo를 찾을 수 없습니다.' });
    }

    // 업데이트할 필드만 처리
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (priority !== undefined) updates.priority = priority;
    if (category_id !== undefined) updates.category_id = category_id || null;
    if (recurrence !== undefined) updates.recurrence = recurrence;
    if (completed !== undefined) {
      updates.completed = completed ? 1 : 0;
      updates.completed_at = completed ? new Date().toISOString() : null;
    }
    updates.updated_at = new Date().toISOString();

    const keys = Object.keys(updates);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => updates[k]);

    await dbRun(`UPDATE todos SET ${setClause} WHERE id = ?`, [...values, req.params.id]);

    const updatedTodo = await dbGet('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedTodo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/todos/:id/toggle - 완료 상태 토글
router.patch('/:id/toggle', async (req, res) => {
  try {
    const todo = await dbGet('SELECT completed FROM todos WHERE id = ?', [req.params.id]);

    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo를 찾을 수 없습니다.' });
    }

    const newCompleted = todo.completed ? 0 : 1;
    const completedAt = newCompleted ? new Date().toISOString() : null;

    await dbRun(`
      UPDATE todos
      SET completed = ?, completed_at = ?, updated_at = ?
      WHERE id = ?
    `, [newCompleted, completedAt, new Date().toISOString(), req.params.id]);

    const updatedTodo = await dbGet('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedTodo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/todos/:id - Todo 삭제
router.delete('/:id', async (req, res) => {
  try {
    const todo = await dbGet('SELECT * FROM todos WHERE id = ?', [req.params.id]);

    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo를 찾을 수 없습니다.' });
    }

    await dbRun('DELETE FROM todos WHERE id = ?', [req.params.id]);

    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
