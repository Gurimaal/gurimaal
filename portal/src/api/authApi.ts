import { ApiError, apiClient, frappeApiBaseUrl } from "./client";

type Nullable<T> = T | null;

export type LoginResponse = {
  user: {
    name: string;
    full_name?: Nullable<string>;
    email?: Nullable<string>;
    mobile_no?: Nullable<string>;
  };
  tenant?: {
    name?: Nullable<string>;
    tenant_name?: Nullable<string>;
    user?: Nullable<string>;
    customer?: Nullable<string>;
    mobile_no?: Nullable<string>;
    email?: Nullable<string>;
    national_id?: Nullable<string>;
    status?: Nullable<string>;
  };
};

export type MeResponse = {
  user: LoginResponse["user"];
  tenant?: LoginResponse["tenant"];
};

export const authApi = {
  login: loginWithFrappe,
  logout: () => apiClient.method("gurimaal.api.auth.logout"),
  me: getCurrentSession,
};

async function loginWithFrappe(usr: string, pwd: string) {
  const form = new URLSearchParams();
  form.set("usr", usr);
  form.set("pwd", pwd);

  const response = await fetch(`${frappeApiBaseUrl}/api/method/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    credentials: "include",
    body: form,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.exc || payload?.exception) {
    throw new ApiError(getFrappeError(payload) || "Username/email ama password waa qalad.", response.status);
  }

  return getCurrentSession();
}

async function getCurrentSession() {
  const response = await fetch(`${frappeApiBaseUrl}/api/method/gurimaal.api.auth.me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.exc || payload?.exception) {
    throw new ApiError(getFrappeError(payload) || "Could not load your portal session.", response.status);
  }

  const message = payload?.message;
  if (message && typeof message === "object" && "ok" in message) {
    if (!message.ok) {
      throw new ApiError(message.message || "Could not load your portal session.", response.status);
    }

    return message.data as LoginResponse;
  }

  return message as LoginResponse;
}

function getFrappeError(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;

  const message = "message" in payload ? payload.message : null;
  if (typeof message === "string") return message;

  const serverMessages = "_server_messages" in payload ? payload._server_messages : null;
  if (typeof serverMessages === "string") {
    try {
      const messages = JSON.parse(serverMessages) as string[];
      const first = messages[0] ? JSON.parse(messages[0]) : null;
      return first?.message ?? serverMessages;
    } catch {
      return serverMessages;
    }
  }

  const exception = "exception" in payload ? payload.exception : null;
  if (typeof exception === "string") return exception;

  const exc = "exc" in payload ? payload.exc : null;
  return typeof exc === "string" ? exc : null;
}
