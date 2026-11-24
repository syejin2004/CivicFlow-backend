const db = require('../config/db');

// 기준 정보(분야·부서) 조회 규칙
// - 이름이 빈 행('')은 사용하지 않음
// - 같은 이름의 행이 여러 개면 가장 먼저 등록된 행(최소 id)을 사용
// - 같은 이름인데 code가 서로 다르면 어느 쪽인지 확정할 수 없으므로 오류 처리 (임의 연결 방지)

class ReferenceDataError extends Error {}

// 분야 이름으로 실제 categories.id 조회
const findCategoryIdByName = async (name) => {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed) throw new ReferenceDataError('민원 분야가 지정되지 않았습니다.');

  const [rows] = await db.query(
    `SELECT id, code FROM categories WHERE name = ? AND name <> '' ORDER BY id`,
    [trimmed]
  );
  if (rows.length === 0) throw new ReferenceDataError(`등록되지 않은 민원 분야입니다: ${trimmed}`);

  const codes = new Set(rows.map((r) => r.code));
  if (codes.size > 1) throw new ReferenceDataError(`민원 분야 '${trimmed}'의 기준 정보가 중복되어 확정할 수 없습니다.`);

  return rows[0].id;
};

// 사용 가능한 부서 목록 (이름 없는 행 제외, 이름별 최초 등록 행만)
const listDepartments = async () => {
  const [rows] = await db.query(
    `SELECT d.id, d.dept_name, d.contact
     FROM departments d
     JOIN (SELECT MIN(id) AS id FROM departments WHERE dept_name <> '' GROUP BY dept_name) first_row
       ON d.id = first_row.id
     ORDER BY d.id`
  );
  return rows;
};

// 부서 id가 사용 가능한 부서인지 확인 후 부서 정보 반환
const findValidDepartment = async (departmentId) => {
  const id = Number(departmentId);
  if (!Number.isInteger(id) || id <= 0) throw new ReferenceDataError('담당 부서를 선택해 주세요.');
  const departments = await listDepartments();
  const matched = departments.find((d) => d.id === id);
  if (!matched) throw new ReferenceDataError('선택할 수 없는 부서입니다.');
  return matched;
};

// 분야 id가 사용 가능한 분야인지 확인 (이름 있는 행만 허용)
const assertValidCategoryId = async (categoryId) => {
  const id = Number(categoryId);
  const [rows] = await db.query(`SELECT id FROM categories WHERE id = ? AND name <> ''`, [id]);
  if (rows.length === 0) throw new ReferenceDataError('선택할 수 없는 민원 분야입니다.');
  return id;
};

module.exports = {
  ReferenceDataError,
  findCategoryIdByName,
  listDepartments,
  findValidDepartment,
  assertValidCategoryId,
};
