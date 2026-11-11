// Single source of truth for dashboard roles and what each one can reach.
// Used by the server (proxy) and the UI. To add a role: add it here, no database change needed
// (Admin.role is a plain text column).

export const ROLES = {
  superadmin: { label: "مدير عام", description: "كل الأقسام وإدارة المستخدمين" },
  news_admin: { label: "المركز الإعلامي", description: "الأخبار والإعلانات والإشعارات" },
  aid_admin: { label: "المركز الإنساني", description: "طلبات المساعدة" },
  media_aid_admin: {
    label: "المركز الإعلامي والإنساني",
    description: "الأخبار والإعلانات والإشعارات وطلبات المساعدة",
  },
  secretary: { label: "السكرتارية", description: "طلبات المساعدة ومعلومات التواصل وأرقام الطوارئ" },
} as const;

export type Role = keyof typeof ROLES;

export const isRole = (value: unknown): value is Role =>
  typeof value === "string" && Object.hasOwn(ROLES, value);

const SUPER: Role[] = ["superadmin"];
const AID: Role[] = ["superadmin", "aid_admin", "media_aid_admin", "secretary"];
const MEDIA: Role[] = ["superadmin", "news_admin", "media_aid_admin"];
const OFFICE: Role[] = ["superadmin", "secretary"];

// Which roles may use each area. Paths not listed are open to any logged-in admin.
const RULES: [string, Role[]][] = [
  ["/admin/dashboard/aid-requests", AID],
  ["/admin/dashboard/news", MEDIA],
  ["/admin/dashboard/announcements", MEDIA],
  ["/admin/dashboard/notifications", MEDIA],
  ["/admin/dashboard/emergency", OFFICE],
  ["/admin/dashboard/contact", OFFICE],
  ["/admin/dashboard/users", SUPER],
  ["/api/admin/forms", AID],
  ["/api/admin/attachment", AID],
  ["/api/admin/news", MEDIA],
  ["/api/admin/announcements", MEDIA],
  ["/api/admin/notifications", MEDIA],
  ["/api/admin/upload", MEDIA],
  ["/api/admin/emergency", OFFICE],
  ["/api/admin/contact", OFFICE],
  ["/api/admin/users", SUPER],
];

export function canAccess(pathname: string, method: string, role: unknown): boolean {
  if (!isRole(role)) return false;
  // Deleting every aid request is reserved for the super admin
  if (pathname === "/api/admin/forms" && method === "DELETE") return role === "superadmin";
  const rule = RULES.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/"));
  return !rule || rule[1].includes(role);
}

export const canSeeAidRequests = (role: unknown): boolean => isRole(role) && AID.includes(role);
