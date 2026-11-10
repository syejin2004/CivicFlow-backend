const db = require('../config/db');

// 민원 접수
const createComplaint = async (req, res) => {
  const { title, content, location, category_id } = req.body;
  const citizen_id = req.user.id;

  try {
    await db.query(
      `INSERT INTO complaints 
       (citizen_id, title, content, location, category_id, status) 
       VALUES (?, ?, ?, ?, ?, 'SUBMITTED')`,
      [citizen_id, title, content, location, category_id]
    );

    res.status(201).json({ message: '민원 접수 완료' });
  } catch (err) {
    res.status(500).json({ message: '민원 접수 실패', error: err.message });
  }
};

// 전체 민원 목록 (담당자/관리자용)
const getAllComplaints = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.username, cat.name as category_name
       FROM complaints c
       LEFT JOIN users u ON c.citizen_id = u.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       ORDER BY c.created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
};

// 내 민원 목록 (시민용)
const getMyComplaints = async (req, res) => {
  const citizen_id = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT c.*, cat.name as category_name
       FROM complaints c
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.citizen_id = ?
       ORDER BY c.created_at DESC`,
      [citizen_id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
};

// 민원 상세 조회
const getComplaintById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT c.*, u.username, cat.name as category_name,
              d.dept_name as department_name
       FROM complaints c
       LEFT JOIN users u ON c.citizen_id = u.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '민원 없음' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById
};