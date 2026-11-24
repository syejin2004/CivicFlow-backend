const db = require('../config/db');
const { COMPLAINT_CATEGORIES } = require('../constants/complaintCategories');
const { findCategoryIdByName, ReferenceDataError } = require('../services/referenceService');

// AI 추천 값 검증: 분류 체계에 있는 분야·부서 조합일 때만 저장 (아니면 null)
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

// 민원 접수 (AI 추천 분야·부서가 있으면 ai_* 컬럼에 함께 저장, 최종 부서는 담당자 확정 시 department_id에 저장)
// category_name 이 오면 DB categories 에서 실제 id를 조회하고, 없으면 기존처럼 category_id 사용
const createComplaint = async (req, res) => {
  const { title, content, location, category_name } = req.body;
  let { category_id } = req.body;
  const citizen_id = req.user.id;
  const { aiCategory, aiDepartment, aiReason } = sanitizeAiRecommendation(req.body);

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
       (citizen_id, title, content, location, category_id, status, ai_category, ai_department, ai_reason)
       VALUES (?, ?, ?, ?, ?, 'SUBMITTED', ?, ?, ?)`,
      [citizen_id, title, content, location, category_id, aiCategory, aiDepartment, aiReason]
    );

    res.status(201).json({ message: '민원 접수 완료', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: '민원 접수 실패', error: err.message });
  }
};

// 전체 민원 목록 (담당자/관리자용)
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
