const db = require('../config/db');

const transitions = {
  'SUBMITTED': ['ASSIGNED'],
  'ASSIGNED': ['PROCESSING'],
  'PROCESSING': ['COMPLETED', 'REJECTED'],
  'COMPLETED': [],
  'REJECTED': []
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { next_status, memo, assigned_to } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM complaints WHERE id = ?', [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '민원 없음' });
    }

    const complaint = rows[0];
    const currentStatus = complaint.status;

    if (!transitions[currentStatus].includes(next_status)) {
      return res.status(400).json({
        message: `${currentStatus} 에서 ${next_status} 로 전환 불가`,
        allowed: transitions[currentStatus]
      });
    }

    if (next_status === 'ASSIGNED') {
      const assignedTo = assigned_to || req.user.id;
      await db.query(
        'UPDATE complaints SET status = ?, assigned_to = ? WHERE id = ?',
        [next_status, assignedTo, id]
      );
    } else {
      await db.query(
        'UPDATE complaints SET status = ? WHERE id = ?',
        [next_status, id]
      );
    }

    await db.query(
      `INSERT INTO process_history 
       (complaint_id, actor_id, previous_status, next_status, memo)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.user.id, currentStatus, next_status, memo || '']
    );

    res.json({
      message: '상태 변경 완료',
      previous_status: currentStatus,
      next_status
    });

  } catch (err) {
    res.status(500).json({ message: '상태 변경 실패', error: err.message });
  }
};

const getHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT ph.*, u.username 
       FROM process_history ph
       LEFT JOIN users u ON ph.actor_id = u.id
       WHERE ph.complaint_id = ?
       ORDER BY ph.changed_at ASC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '이력 조회 실패', error: err.message });
  }
};

module.exports = { updateStatus, getHistory };