const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 회원가입
const register = async (req, res) => {
  const { username, email, password, role, department_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (username, email, password, role, department_id) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'CITIZEN', department_id || null]
    );

    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    res.status(500).json({ message: '회원가입 실패', error: err.message });
  }
};

// 로그인
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: '이메일 없음' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호 틀림' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department_id: user.department_id
      }
    });
  } catch (err) {
    res.status(500).json({ message: '로그인 실패', error: err.message });
  }
};

// 전체 유저 목록 조회 (관리자용)
const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.username, u.email, u.role, u.department_id, d.dept_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
};

module.exports = { register, login, getUsers };