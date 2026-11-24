const db = require('../config/db');

// 유형별 통계
const getStatsByCategory = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        COALESCE(c.ai_category, cat.name, '미분류') as category,
        COUNT(*) as count
       FROM complaints c
       LEFT JOIN categories cat ON c.category_id = cat.id
       GROUP BY category
       ORDER BY count DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '통계 조회 실패', error: err.message });
  }
};

// 상태별 통계
const getStatsByStatus = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM complaints
       GROUP BY status
       ORDER BY count DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '통계 조회 실패', error: err.message });
  }
};

// 기간별 통계 (월별)
const getStatsByPeriod = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
       FROM complaints
       GROUP BY month
       ORDER BY month ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '통계 조회 실패', error: err.message });
  }
};

// 부서별 통계
const getStatsByDepartment = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        COALESCE(c.ai_department, d.dept_name, '미배정') as department,
        COUNT(*) as count
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       GROUP BY department
       ORDER BY count DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '통계 조회 실패', error: err.message });
  }
};

// 전체 요약 통계
const getSummary = async (req, res) => {
  try {
    const [total] = await db.query('SELECT COUNT(*) as total FROM complaints');
    const [completed] = await db.query('SELECT COUNT(*) as count FROM complaints WHERE status = "COMPLETED"');
    const [processing] = await db.query('SELECT COUNT(*) as count FROM complaints WHERE status = "PROCESSING"');
    const [submitted] = await db.query('SELECT COUNT(*) as count FROM complaints WHERE status = "SUBMITTED"');

    res.json({
      total: total[0].total,
      completed: completed[0].count,
      processing: processing[0].count,
      submitted: submitted[0].count,
    });
  } catch (err) {
    res.status(500).json({ message: '통계 조회 실패', error: err.message });
  }
};

module.exports = {
  getStatsByCategory,
  getStatsByStatus,
  getStatsByPeriod,
  getStatsByDepartment,
  getSummary
};