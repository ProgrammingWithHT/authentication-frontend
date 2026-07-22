function getErrorMessage(payload) {
  if (!payload) {
    return 'Request failed.';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(' ');
  }

  if (typeof payload.message === 'string') {
    return payload.message;
  }

  return 'Request failed.';
}

export async function apiRequest(baseUrl, path, options = {}) {
  const { method = 'GET', body, token = '' } = options;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return payload;
}
