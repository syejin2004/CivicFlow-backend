const db = require('../config/db');
require('dotenv').config();

// AI 답변 초안 생성
const generateDraft = async (req, res) => {
  const { id } = req.params;

  try {
    // 민원 내용 가져오기
    const [rows] = await db.query(
      `SELECT c.*, cat.name as category_name, d.dept_name
       FROM complaints c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '민원 없음' });
    }

    const complaint = rows[0];

    // Gemini API로 답변 초안 생성
    let draftContent;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `다음 민원에 대한 공식 답변 초안을 작성해주세요.

민원 제목: ${complaint.title}
민원 내용: ${complaint.content}
민원 유형: ${complaint.ai_category || complaint.category_name || '기타'}
담당 부서: ${complaint.ai_department || complaint.dept_name || '민원실'}

조건:
- 공손하고 공식적인 어투로 작성
- 3~5문장으로 작성
- 처리 완료 사실 포함
- 담당 부서 이름 포함`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      draftContent = data.candidates[0].content.parts[0].text;
    } catch (err) {
      // AI 실패시 기본 템플릿 사용
      draftContent = `안녕하세요. ${complaint.ai_department || '담당 부서'}입니다. 
접수하신 "${complaint.title}" 민원을 검토하였습니다. 
해당 민원은 담당 부서에서 확인 후 처리 완료하였습니다. 
불편을 드려 죄송합니다. 추가 문의사항이 있으시면 연락 주시기 바랍니다.`;
    }

    // DB에 AI 초안 저장
    await db.query(
      `INSERT INTO answers (complaint_id, officer_id, content, is_ai_draft)
       VALUES (?, ?, ?, true)
       ON DUPLICATE KEY UPDATE content = ?, is_ai_draft = true`,
      [id, req.user.id, draftContent, draftContent]
    );

    res.json({
      message: 'AI 답변 초안 생성 완료',
      draft: draftContent
    });

  } catch (err) {
    res.status(500).json({ message: '초안 생성 실패', error: err.message });
  }
};

// 최종 답변 확정
const confirmAnswer = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    await db.query(
      `INSERT INTO answers (complaint_id, officer_id, content, is_ai_draft)
       VALUES (?, ?, ?, false)
       ON DUPLICATE KEY UPDATE content = ?, officer_id = ?, is_ai_draft = false`,
      [id, req.user.id, content, content, req.user.id]
    );

    // 민원 상태 완료로 변경
    await db.query(
      'UPDATE complaints SET status = ? WHERE id = ?',
      ['COMPLETED', id]
    );

    // 처리 이력 기록
    await db.query(
      `INSERT INTO process_history 
       (complaint_id, actor_id, previous_status, next_status, memo)
       VALUES (?, ?, 'PROCESSING', 'COMPLETED', '답변 확정 완료')`,
      [id, req.user.id]
    );

    res.json({ message: '답변 확정 완료' });
  } catch (err) {
    res.status(500).json({ message: '답변 확정 실패', error: err.message });
  }
};

// 답변 조회
const getAnswer = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT a.*, u.username as officer_name
       FROM answers a
       LEFT JOIN users u ON a.officer_id = u.id
       WHERE a.complaint_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '답변 없음' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '답변 조회 실패', error: err.message });
  }
};

module.exports = { generateDraft, confirmAnswer, getAnswer };