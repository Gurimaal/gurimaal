type FrappeEnvelope<T> = {
  message?: T;
  exc?: string;
  exception?: string;
  _server_messages?: string;
};

type GurimaalResponse<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

type MethodArgs = Record<string, unknown>;

type MethodOptions = {
  encoding?: "json" | "form";
  csrf?: boolean;
};

declare global {
  interface Window {
    csrf_token?: string;
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | Error | null;
};

export const initialApiState = <T>(): ApiState<T> => ({
  data: null,
  loading: false,
  error: null,
});

export const frappeApiBaseUrl = getBrowserApiBaseUrl();

export async function callFrappeMethod<T>(
  method: string,
  args: MethodArgs = {},
  options: MethodOptions = {},
): Promise<T> {
  let response: Response;
  const encoding = options.encoding ?? "json";
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (encoding === "json") {
    headers["Content-Type"] = "application/json";
  } else {
    headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
  }

  const csrfToken = getCsrfToken();
  if (options.csrf !== false && csrfToken) {
    headers["X-Frappe-CSRF-Token"] = csrfToken;
  }

  try {
    response = await fetch(getMethodUrl(method), {
      method: "POST",
      headers,
      credentials: "include",
      body: getMethodBody(args, encoding),
    });
  } catch {
    throw new ApiError(
      "Cannot reach the Frappe backend. Make sure bench start is running and VITE_FRAPPE_API_URL points to it.",
      0,
    );
  }

  const payload = (await response.json().catch(() => ({}))) as FrappeEnvelope<
    GurimaalResponse<T> | T
  >;

  if (!response.ok || payload.exc || payload.exception) {
    throw new ApiError(getFrappeError(payload) || "Request failed.", response.status);
  }

  const message = payload.message;
  if (isGurimaalResponse<T>(message)) {
    if (!message.ok) {
      throw new ApiError(message.message || "Request failed.", response.status);
    }

    return message.data as T;
  }

  return message as T;
}

export const apiClient = {
  method: callFrappeMethod,
};

function getMethodBody(args: MethodArgs, encoding: MethodOptions["encoding"]) {
  if (encoding === "form") {
    const form = new URLSearchParams();
    Object.entries(args).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.set(key, String(value));
      }
    });
    return form;
  }

  return JSON.stringify(args);
}

function getMethodUrl(method: string) {
  return `${frappeApiBaseUrl}/api/method/${method}`;
}

function getBrowserApiBaseUrl() {
  const configuredUrl = (import.meta.env.VITE_FRAPPE_BROWSER_API_URL || "").replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;

  const frappeUrl = (import.meta.env.VITE_FRAPPE_API_URL || "").replace(/\/$/, "");
  if (import.meta.env.DEV && isLocalUrl(frappeUrl)) {
    return "";
  }

  return frappeUrl;
}

function isLocalUrl(url: string) {
  if (!url) return false;

  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

function getCsrfToken() {
  if (typeof window === "undefined") return "";
  return window.csrf_token ?? "";
}

function isGurimaalResponse<T>(value: unknown): value is GurimaalResponse<T> {
  return Boolean(value && typeof value === "object" && "ok" in value);
}

function getFrappeError(payload: FrappeEnvelope<unknown>) {
  if (payload._server_messages) {
    try {
      const messages = JSON.parse(payload._server_messages) as string[];
      const first = messages[0] ? JSON.parse(messages[0]) : null;
      return first?.message;
    } catch {
      return payload._server_messages;
    }
  }

  return payload.exception || payload.exc;
}
