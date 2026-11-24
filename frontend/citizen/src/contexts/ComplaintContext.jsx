import { createContext, useContext, useState, useEffect } from 'react';

const ComplaintContext = createContext(null);

const BASE_URL = 'https://civicflow-production.up.railway.app/api';

const getToken = () => localStorage.getItem('civicflow_token');

export function ComplaintProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [staff] = useState([]);

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