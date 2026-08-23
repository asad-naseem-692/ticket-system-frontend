import { getStoredToken, clearAuthSession } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ApiErrorResponse extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiErrorResponse";
    this.status = status;
    this.detail = detail;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers = {}, ...customConfig } = options;

  let url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  const token = getStoredToken();
  if (token) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (!(customConfig.body instanceof FormData)) {
    reqHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...customConfig,
    headers: reqHeaders,
  });

  if (response.status === 401) {
    clearAuthSession();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.detail) {
        errorDetail = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new ApiErrorResponse(response.status, errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
