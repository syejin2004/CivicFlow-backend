const db = require('../config/db');
require('dotenv').config();

// 키워드 기반 분류 (Strategy 패턴 - Fallback)
const keywordClassify = (content) => {
  if (content.includes('도로') || content.includes('파손') || content.includes('구멍')) {
    return { category: '도로파손', department: '도로관리과', code: 1 };
  }
  if (content.includes('주차') || content.includes('주정차') || content.includes('불법')) {
    return { category: '불법주정차', department: '교통지도과', code: 2 };
  }
  if (content.includes('쓰레기') || content.includes('투기') || content.includes('악취')) {
    return { category: '쓰레기투기', department: '환경미화과', code: 3 };
  }
  if (content.includes('소음') || content.includes('시끄') || content.includes('소리')) {
    return { category: '소음', department: '생활민원과', code: 4 };
  }
  if (content.includes('가로등') || content.includes('전등') || content.includes('어둠')) {
    return { category: '가로등고장', department: '시설관리과', code: 5 };
  }
  return { category: '기타', department: '민원실', code: 6 };
};

// AI 기반 분류 (Strategy 패턴 - Gemini)
const aiClassify = async (content) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `다음 민원을 분류해주세요.
민원내용: ${content}

분류항목: 도로파손, 불법주정차, 쓰레기투기, 소음, 가로등고장, 기타
담당부서: 도로관리과, 교통지도과, 환경미화과, 생활민원과, 시설관리과, 민원실

반드시 JSON 형식으로만 답하세요:
{"category":"분류결과","department":"담당부서","reason":"분류이유"}`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  console.log('Gemini 응답:', JSON.stringify(data));

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini 응답 없음');
  }

  const text = data.candidates[0].content.parts[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

// 민원 AI 분류 실행
const classifyComplaint = async (req, res) => {
  const { id } = req.params;

  try {
    // 민원 내용 가져오기
    const [rows] = await db.query(
      'SELECT * FROM complaints WHERE id = ?', [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '민원 없음' });
    }

    const complaint = rows[0];
    let result;

    // Strategy 패턴: AI 먼저 시도, 실패시 키워드로 전환
    try {
      result = await aiClassify(complaint.content);
    } catch (err) {
      console.log('AI 분류 실패, 키워드 분류로 전환:', err.message);
      result = keywordClassify(complaint.content);
    }

    // DB에 AI 추천 결과 저장
    await db.query(
      `UPDATE complaints 
       SET ai_category = ?, ai_department = ?, ai_reason = ?
       WHERE id = ?`,
      [result.category, result.department, result.reason || '키워드 분류', id]
    );

    res.json({
      message: 'AI 분류 완료',
      result: {
        category: result.category,
        department: result.department,
        reason: result.reason || '키워드 분류'
      }
    });

  } catch (err) {
    res.status(500).json({ message: '분류 실패', error: err.message });
  }
};

// 담당자가 AI 분류 확정
const confirmClassify = async (req, res) => {
  const { id } = req.params;
  const { category_id, department_id } = req.body;

  try {
    await db.query(
      `UPDATE complaints 
       SET category_id = ?, department_id = ?, status = 'ASSIGNED'
       WHERE id = ?`,
      [category_id, department_id, id]
    );

    // 처리 이력 기록
    await db.query(
      `INSERT INTO process_history 
       (complaint_id, actor_id, previous_status, next_status, memo)
       VALUES (?, ?, 'SUBMITTED', 'ASSIGNED', 'AI 분류 확정')`,
      [id, req.user.id]
    );

    res.json({ message: '분류 확정 완료' });
  } catch (err) {
    res.status(500).json({ message: '확정 실패', error: err.message });
  }
};

module.exports = { classifyComplaint, confirmClassify };