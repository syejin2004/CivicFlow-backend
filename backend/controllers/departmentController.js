const { listDepartments } = require('../services/referenceService');

// 담당 부서 확정용 부서 목록 조회 (이름 없는 행·중복 행 제외)
const getDepartments = async (req, res) => {
  try {
    const departments = await listDepartments();
    res.json({ message: '부서 목록 조회 완료', data: departments });
  } catch (err) {
    res.status(500).json({ message: '부서 목록 조회 실패', error: err.message, data: null });
  }
};

module.exports = { getDepartments };
