import type { LoginResponse } from "@/api/authApi";

const SESSION_KEY = "gurimaal.portal.session";

export type PortalSession = {
  user: LoginResponse["user"];
  tenant?: LoginResponse["tenant"];
  remembered?: boolean;
};

export function getStoredSession(): PortalSession | null {
  if (typeof window === "undefined") return null;

  const raw =
    window.localStorage.getItem(SESSION_KEY) || window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PortalSession;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function storeSession(session: PortalSession, remember: boolean) {
  if (typeof window === "undefined") return;

  clearStoredSession();
  const target = remember ? window.localStorage : window.sessionStorage;
  target.setItem(SESSION_KEY, JSON.stringify({ ...session, remembered: remember }));
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated() {
  return Boolean(getStoredSession()?.user);
}

export function getSessionDisplayName(session?: PortalSession | null) {
  return (
    session?.tenant?.tenant_name ||
    session?.user?.full_name ||
    getNameFromEmail(session?.user?.email || session?.user?.name) ||
    "Tenant"
  );
}

export function getSessionSubtitle(session?: PortalSession | null) {
  return session?.user?.email || session?.tenant?.email || session?.tenant?.name || "Tenant Portal";
}

export function getSessionInitials(session?: PortalSession | null) {
  return getInitials(getSessionDisplayName(session));
}

function getNameFromEmail(email?: string) {
  const username = email?.split("@")[0];
  if (!username) return "";

  return username
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(value: string) {
  return value
    .split(/[.\s@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
