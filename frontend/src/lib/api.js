const BASE = '';

const token = () => localStorage.getItem('admin_token');

const h = (withAuth = false) => ({
  'Content-Type': 'application/json',
  ...(withAuth && token() ? { Authorization: `Bearer ${token()}` } : {}),
});

async function req(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Public ────────────────────────────────────────────────────────────────────
export const getProfessors = () => req(`${BASE}/api/professors`);
export const getProfessor = (id) => req(`${BASE}/api/professors/${id}`);
export const getTopicQuestions = (id) => req(`${BASE}/api/topics/${id}/questions`);
export const askProfessor = (data) =>
  req(`${BASE}/api/ask`, { method: 'POST', headers: h(), body: JSON.stringify(data) });

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (password) =>
  req(`${BASE}/api/auth/login`, { method: 'POST', headers: h(), body: JSON.stringify({ password }) });

// ── Admin: Professors ─────────────────────────────────────────────────────────
export const adminGetProfessors = () => req(`${BASE}/api/admin/professors`, { headers: h(true) });
export const adminCreateProfessor = (data) =>
  req(`${BASE}/api/admin/professors`, { method: 'POST', headers: h(true), body: JSON.stringify(data) });
export const adminUpdateProfessor = (id, data) =>
  req(`${BASE}/api/admin/professors/${id}`, { method: 'PUT', headers: h(true), body: JSON.stringify(data) });
export const adminDeleteProfessor = (id) =>
  req(`${BASE}/api/admin/professors/${id}`, { method: 'DELETE', headers: h(true) });

// ── Admin: Topics ─────────────────────────────────────────────────────────────
export const adminGetTopics = (professorId) =>
  req(`${BASE}/api/admin/topics${professorId ? `?professor_id=${professorId}` : ''}`, { headers: h(true) });
export const adminCreateTopic = (data) =>
  req(`${BASE}/api/admin/topics`, { method: 'POST', headers: h(true), body: JSON.stringify(data) });
export const adminUpdateTopic = (id, data) =>
  req(`${BASE}/api/admin/topics/${id}`, { method: 'PUT', headers: h(true), body: JSON.stringify(data) });
export const adminDeleteTopic = (id) =>
  req(`${BASE}/api/admin/topics/${id}`, { method: 'DELETE', headers: h(true) });

// ── Admin: Questions ──────────────────────────────────────────────────────────
export const adminGetQuestions = (topicId) =>
  req(`${BASE}/api/admin/questions${topicId ? `?topic_id=${topicId}` : ''}`, { headers: h(true) });
export const adminCreateQuestion = (data) =>
  req(`${BASE}/api/admin/questions`, { method: 'POST', headers: h(true), body: JSON.stringify(data) });
export const adminUpdateQuestion = (id, data) =>
  req(`${BASE}/api/admin/questions/${id}`, { method: 'PUT', headers: h(true), body: JSON.stringify(data) });
export const adminDeleteQuestion = (id) =>
  req(`${BASE}/api/admin/questions/${id}`, { method: 'DELETE', headers: h(true) });

// ── Admin: Images ─────────────────────────────────────────────────────────────
export const adminGetImages = (questionId) =>
  req(`${BASE}/api/admin/questions/${questionId}/images`, { headers: h(true) });
export const adminCreateImage = (questionId, data) =>
  req(`${BASE}/api/admin/questions/${questionId}/images`, { method: 'POST', headers: h(true), body: JSON.stringify(data) });
export const adminDeleteImage = (questionId, imageId) =>
  req(`${BASE}/api/admin/questions/${questionId}/images/${imageId}`, { method: 'DELETE', headers: h(true) });

// ── Admin: AI Config ──────────────────────────────────────────────────────────
export const adminGetAIConfig = (professorId) =>
  req(`${BASE}/api/admin/ai-config/${professorId}`, { headers: h(true) });
export const adminUpdateAIConfig = (professorId, data) =>
  req(`${BASE}/api/admin/ai-config/${professorId}`, { method: 'PUT', headers: h(true), body: JSON.stringify(data) });
export const adminTestAIConfig = (professorId, data) =>
  req(`${BASE}/api/admin/ai-config/${professorId}/test`, { method: 'POST', headers: h(true), body: JSON.stringify(data) });

// ── Admin: Stats ──────────────────────────────────────────────────────────────
export const adminGetStats = () => req(`${BASE}/api/admin/stats`, { headers: h(true) });
