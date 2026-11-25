const db = require('../config/db');
const { COMPLAINT_CATEGORIES } = require('../constants/complaintCategories');
const { findCategoryIdByName, ReferenceDataError } = require('../services/referenceService');

const sanitizeAiRecommendation = ({ ai_category, ai_department, ai_reason }) => {
  const matched = COMPLAINT_CATEGORIES.find(
    (c) => c.category === ai_category && c.department === ai_department
  );
  if (!matched) return { aiCategory: null, aiDepartment: null, aiReason: null };
  return {
    aiCategory: matched.category,
    aiDepartment: matched.department,
    aiReason: typeof ai_reason === 'string' ? ai_reason.slice(0, 255) : null,
  };
};

const createComplaint = async (req, res) => {
  const { title, content, location, category_name } = req.body;
  let { category_id } = req.body;
  const citizen_id = req.user.id;
  const { aiCategory, aiDepartment, aiReason } = sanitizeAiRecommendation(req.body);

  const imageUrls = req.files ? req.files.map(f => f.path).join(',') : null;

  try {
    if (category_name !== undefined) {
      try {
        category_id = await findCategoryIdByName(category_name);
      } catch (err) {
        if (err instanceof ReferenceDataError) return res.status(400).json({ message: err.message, data: null });
        throw err;
      }
    }

    const [result] = await db.query(
      `INSERT INTO complaints
       (citizen_id, title, content, location, category_id, status, ai_category, ai_department, ai_reason, images)
       VALUES (?, ?, ?, ?, ?, 'SUBMITTED', ?, ?, ?, ?)`,
      [citizen_id, title, content, location, category_id, aiCategory, aiDepartment, aiReason, imageUrls]
    );

    res.status(201).json({ message: '민원 접수 완료', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: '민원 접수 실패', error: err.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.username, cat.name as category_name,
              d.dept_name as department_name
       FROM complaints c
       LEFT JOIN users u ON c.citizen_id = u.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN departments d ON c.department_id = d.id
       ORDER BY c.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
};

const getMyComplaints = async (req, res) => {
  const citizen_id = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT c.*, cat.name as category_name,
              a.content as answer_content,
              a.created_at as answer_created_at
       FROM complaints c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN answers a ON c.id = a.complaint_id
       WHERE c.citizen_id = ?
       ORDER BY c.created_at DESC`,
      [citizen_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
};

const getComplaintById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.username, cat.name as category_name,
              d.dept_name as department_name,
              a.content as answer_content,
              a.created_at as answer_created_at
       FROM complaints c
       LEFT JOIN users u ON c.citizen_id = u.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN departments d ON c.department_id = d.id
       LEFT JOIN answers a ON c.id = a.complaint_id
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