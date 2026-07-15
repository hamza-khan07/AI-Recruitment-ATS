export const AUTH_TOKEN_KEY = "ats_access_token";
export const AUTH_REFRESH_TOKEN_KEY = "ats_refresh_token";
export const AUTH_USER_ROLE_KEY = "ats_user_role";

export function saveAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function saveRefreshToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
}

export function removeAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_ROLE_KEY);
}

export function saveUserRole(role: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_USER_ROLE_KEY, role);
}

export function getUserRole() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_USER_ROLE_KEY);
}
