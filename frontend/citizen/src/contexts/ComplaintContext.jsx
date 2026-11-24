import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const ComplaintContext = createContext(null);

const BASE_URL = API_BASE_URL;

const getToken = () => localStorage.getItem('civicflow_token');

export function ComplaintProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [staff] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${BASE_URL}/complaints`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (e) {
      console.error('민원 조회 실패:', e);
    }
  };

  const addComplaint = async (newComplaint) => {
    try {
      const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(newComplaint)
      });
      const data = await res.json();
      if (res.ok) await fetchComplaints();
      return data;
    } catch (e) {
      console.error('민원 접수 실패:', e);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ next_status: newStatus, memo: '상태 변경' })
      });
      if (res.ok) await fetchComplaints();
    } catch (e) {
      console.error('상태 변경 실패:', e);
    }
  };

  const updateComplaintAnswer = async (complaintId, answer) => {
    try {
      const res = await fetch(`${BASE_URL}/complaints/${complaintId}/answer/final`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ content: answer })
      });
      if (res.ok) await fetchComplaints();
    } catch (e) {
      console.error('답변 작성 실패:', e);
    }
  };

  // 담당 부서 확정용 부서 목록 조회 (담당자/관리자 전용)
  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/departments`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(body.data)) {
        setDepartments(body.data);
        return body.data;
      }
    } catch (e) {
      console.error('부서 목록 조회 실패:', e);
    }
    return [];
  };

  // 최종 담당 부서 확정 (기존 PATCH /:id/confirm API 사용)
  const confirmDepartment = async (complaintId, departmentId) => {
    try {
      const res = await fetch(`${BASE_URL}/complaints/${complaintId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ department_id: departmentId })
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) await fetchComplaints();
      return { success: res.ok, message: body.message || (res.ok ? '담당 부서가 확정되었습니다.' : '담당 부서 확정에 실패했습니다.'), data: body.data };
    } catch (e) {
      console.error('담당 부서 확정 실패:', e);
      return { success: false, message: '서버에 연결할 수 없습니다.' };
    }
  };

  const completeComplaint = async (complaintId, answer) => {
    await updateComplaintAnswer(complaintId, answer);
    await updateComplaintStatus(complaintId, 'COMPLETED');
  };

  const assignComplaint = async (complaintId) => {
    await updateComplaintStatus(complaintId, 'ASSIGNED');
  };

  const assignMultipleComplaints = async (complaintIds) => {
    for (const id of complaintIds) {
      await assignComplaint(id);
    }
  };

  const value = {
    complaints,
    staff,
    fetchComplaints,
    updateComplaintStatus,
    updateComplaintAnswer,
    completeComplaint,
    assignComplaint,
    assignMultipleComplaints,
    addComplaint,
    departments,
    fetchDepartments,
    confirmDepartment,
  };

  return <ComplaintContext.Provider value={value}>{children}</ComplaintContext.Provider>;
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within ComplaintProvider');
  }
  return context;
}