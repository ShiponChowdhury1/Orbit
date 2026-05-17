export const uid = (prefix = "") =>
  prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
