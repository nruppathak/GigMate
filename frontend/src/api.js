const API_BASE = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchUsers(role) {
  const url = role ? `${API_BASE}/users?role=${role}` : `${API_BASE}/users`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchUserById(id) {
  const res = await fetch(`${API_BASE}/users/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function addUserSkill(userId, skill_name, level) {
  const res = await fetch(`${API_BASE}/users/${userId}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skill_name, level }),
  });
  if (!res.ok) throw new Error('Failed to add skill');
  return res.json();
}

export async function deleteUserSkill(userId, skillName) {
  const res = await fetch(`${API_BASE}/users/${userId}/skills/${encodeURIComponent(skillName)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete skill');
  return res.json();
}

export async function addPortfolioItem(userId, data) {
  const res = await fetch(`${API_BASE}/users/${userId}/portfolios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add portfolio item');
  return res.json();
}

export async function deletePortfolioItem(portfolioId) {
  const res = await fetch(`${API_BASE}/portfolios/${portfolioId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete portfolio');
  return res.json();
}

export async function fetchProjects({ category, search, studentId, clientId, status } = {}) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  if (studentId) params.append('studentId', studentId);
  if (clientId) params.append('clientId', clientId);
  if (status) params.append('status', status);

  const res = await fetch(`${API_BASE}/projects?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function fetchProjectById(id) {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

export async function createProject(data) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function updateProjectStatus(id, status) {
  const res = await fetch(`${API_BASE}/projects/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update project status');
  return res.json();
}

export async function fetchRecommendedProjects(studentId) {
  const res = await fetch(`${API_BASE}/recommendations/projects/${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch recommended projects');
  return res.json();
}

export async function fetchRecommendedStudents(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/recommended-students`);
  if (!res.ok) throw new Error('Failed to fetch recommended students');
  return res.json();
}

export async function fetchApplications({ studentId, projectId, clientId } = {}) {
  const params = new URLSearchParams();
  if (studentId) params.append('studentId', studentId);
  if (projectId) params.append('projectId', projectId);
  if (clientId) params.append('clientId', clientId);

  const res = await fetch(`${API_BASE}/applications?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function submitApplication(data) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to submit application');
  return json;
}

export async function updateApplicationStatus(id, status) {
  let res = await fetch(`${API_BASE}/applications/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    res = await fetch(`${API_BASE}/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update application status');
  }
  return res.json();
}

export async function withdrawApplication(id, studentId) {
  const res = await fetch(`${API_BASE}/applications/${id}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id: studentId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Failed to withdraw application');
  return json;
}

export async function submitReview(data) {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
}

export async function fetchMessages({ projectId, userId1, userId2 } = {}) {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  if (userId1) params.append('userId1', userId1);
  if (userId2) params.append('userId2', userId2);

  const res = await fetch(`${API_BASE}/messages?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function fetchConversations(userId) {
  let res = await fetch(`${API_BASE}/conversations/${userId}`);
  if (!res.ok) {
    res = await fetch(`${API_BASE}/messages/conversations/${userId}`);
  }
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload file');
  }
  return res.json();
}

export async function sendMessage(data) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Invalid login ID or password');
  }
  return res.json();
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create profile');
  }
  return res.json();
}

export async function deleteUser(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete profile');
  }
  return res.json();
}

export async function deleteAllCustomUsers() {
  const res = await fetch(`${API_BASE}/users/cleanup/all-custom`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete custom profiles');
  }
  return res.json();
}
