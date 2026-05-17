// Local-only mock password "hash". NOT cryptographically secure — this app
// has no backend, so credentials live in the user's own localStorage.
// Salted djb2 hash keeps stored values opaque-looking but is deterministic.
const SALT = "orbit-local-v1";

export function hashPassword(password: string): string {
  const input = SALT + ":" + password;
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
  }
  // produce a 16-char hex-ish string
  const a = (h >>> 0).toString(16).padStart(8, "0");
  let h2 = 52711;
  for (let i = input.length - 1; i >= 0; i--) {
    h2 = ((h2 << 5) + h2) ^ input.charCodeAt(i);
  }
  const b = (h2 >>> 0).toString(16).padStart(8, "0");
  return a + b;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function randomToken(): string {
  const arr = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(arr);
  else for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
