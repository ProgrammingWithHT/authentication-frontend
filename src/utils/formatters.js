export function formatResponse(label, payload) {
  return JSON.stringify(
    {
      label,
      payload,
    },
    null,
    2,
  );
}

export function formatDate(value) {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString();
}
