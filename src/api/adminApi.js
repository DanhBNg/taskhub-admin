const backendBaseUrl = (import.meta.env.VITE_BACKEND_BASE_URL || 'https://taskhub-backend-ords.onrender.com').replace(/\/$/, '');

async function requestAdmin(path, token, options = {}) {
  const response = await fetch(`${backendBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.error || 'Kh?ng th? g?i API qu?n tr?.');
  }

  return payload;
}

export function fetchStats(token) {
  return requestAdmin('/api/admin/stats', token);
}

export function fetchUsers(token) {
  return requestAdmin('/api/admin/users?limit=200', token);
}

export function fetchProjects(token) {
  return requestAdmin('/api/admin/projects?limit=200', token);
}

export function fetchTasks(token) {
  return requestAdmin('/api/admin/tasks?limit=250', token);
}

export function updateUserRole(token, uid, systemRole) {
  return requestAdmin(`/api/admin/users/${uid}/role`, token, {
    method: 'PATCH',
    body: JSON.stringify({ systemRole }),
  });
}

export function updateProjectStatus(token, projectId, status) {
  return requestAdmin(`/api/admin/projects/${projectId}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
