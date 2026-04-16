const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  }

  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url, config)
  if (!res.ok) {
    const error = new Error('API request failed')
    error.status = res.status
    const info = await res.json().catch(() => null)
    error.info = info
    error.message = info?.error || info?.message || 'API request failed'
    throw error
  }
  return res.json()
}

export function getAdminAttendanceList(month) {
  return request(`/admin/attendance?month=${month}`)
}

export function reviewCorrectionRequest(requestId, status) {
  return request(`/admin/correction-requests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function getCorrectionRequests(status) {
  const query = status ? `?status=${status}` : ''
  return request(`/admin/correction-requests${query}`)
}

export const fetcher = (url) => request(url)
