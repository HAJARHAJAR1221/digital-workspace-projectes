const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface ApiOptions extends RequestInit {
  auth?: boolean;
}

const getToken = () => {
  const saved = localStorage.getItem("sdw_token");
  return saved || null;
};

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (options.auth) {
    const token = getToken();
    if (token) {
      (headers as any).Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Erreur API (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

