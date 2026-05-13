import { API_URL, FETCH_DEFAULTS } from "./api";

export interface AuthUser {
  user_id: number;
  username: string;
  email: string | null;
  country: string | null;
  language: string;
  dialect: string | null;
  communication_style: string;
  target_language: string;
  has_voice_sample: boolean;
}

export interface RegisterPayload {
  username: string;
  password: string;
  confirm_password: string;
  email?: string;
  country?: string;
  language?: string;
  dialect?: string;
  communication_style?: string;
  target_language?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  remember?: boolean;
}

async function authFetch<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { ...FETCH_DEFAULTS, ...init });
  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      detail = data?.detail ?? detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
  }
  if (res.status === 204) {
    return undefined as unknown as T;
  }
  return res.json();
}

export async function apiRegister(payload: RegisterPayload): Promise<AuthUser> {
  return authFetch<AuthUser>("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function apiLogin(payload: LoginPayload): Promise<AuthUser> {
  return authFetch<AuthUser>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function apiLogout(): Promise<void> {
  await authFetch<void>("/api/auth/logout", { method: "POST" });
}

export async function apiMe(): Promise<AuthUser | null> {
  try {
    return await authFetch<AuthUser>("/api/auth/me", { method: "GET" });
  } catch {
    return null;
  }
}

export interface ProfileUpdatePayload {
  email?: string | null;
  country?: string | null;
  language?: string;
  dialect?: string | null;
  communication_style?: string;
  target_language?: string;
}

export async function apiUpdateProfile(payload: ProfileUpdatePayload): Promise<AuthUser> {
  return authFetch<AuthUser>("/api/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function apiChangePassword(
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string
): Promise<void> {
  await authFetch<void>("/api/users/me/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    }),
  });
}

export async function apiUploadVoiceSample(audio: Blob): Promise<AuthUser> {
  const form = new FormData();
  form.append("audio", audio, "voice-sample.webm");
  return authFetch<AuthUser>("/api/users/me/voice-sample", {
    method: "POST",
    body: form,
  });
}

export async function apiDeleteVoiceSample(): Promise<AuthUser> {
  return authFetch<AuthUser>("/api/users/me/voice-sample", {
    method: "DELETE",
  });
}

export function voiceSampleUrl(): string {
  return `${API_URL}/api/users/me/voice-sample`;
}
