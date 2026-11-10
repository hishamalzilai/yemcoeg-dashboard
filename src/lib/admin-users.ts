import { DEFAULT_ADMIN_PASSWORD } from "@/lib/security-setup";

export const MIN_PASSWORD_LENGTH = 10;

/** Returns an Arabic error message, or null if the password is acceptable. */
export function passwordProblem(password: unknown): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `كلمة المرور يجب ألا تقل عن ${MIN_PASSWORD_LENGTH} أحرف`;
  }
  if (password.length > 72) return "كلمة المرور طويلة جداً";
  if (password === DEFAULT_ADMIN_PASSWORD) return "لا يمكن استخدام هذه كلمة المرور";
  return null;
}

export function cleanName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const value = name.trim();
  return value.length >= 2 && value.length <= 80 ? value : null;
}

export function cleanEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const value = email.trim().toLowerCase();
  return value.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

/** Fields safe to return to the browser (never the password hash). */
export const ADMIN_PUBLIC_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;
