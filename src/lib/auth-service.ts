import { AuthUser } from "@/types/auth";

const USER_KEY = "portfolio-auth-user";
const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim();

async function readJsonBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

const saveLocalUser = (user: AuthUser | null) => {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
    if (!res.ok) return null;
    return readJsonBody<AuthUser>(res);
  }

  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const signUp = async (email: string, password: string): Promise<{ error?: Error; user?: AuthUser }> => {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await readJsonBody<{ message?: string; user?: AuthUser }>(res);
      if (!res.ok) return { error: new Error(data.message ?? "Sign up failed") };
      return { user: data.user as AuthUser };
    } catch {
      return { error: new Error("Could not reach server. Check internet/API and try again.") };
    }
  }

  const localUser: AuthUser = { id: "local-user", email };
  saveLocalUser(localUser);
  return { user: localUser };
};

export const signIn = async (email: string, password: string): Promise<{ error?: Error; user?: AuthUser }> => {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await readJsonBody<{ message?: string; user?: AuthUser }>(res);
      if (!res.ok) {
        if (res.status === 401) return { error: new Error("Invalid email or password.") };
        if (res.status >= 500) return { error: new Error("Server error during login. Please try again.") };
        return { error: new Error(data.message ?? "Login failed") };
      }
      return { user: data.user as AuthUser };
    } catch {
      return { error: new Error("Could not reach server. Check internet/API and try again.") };
    }
  }

  const localUser: AuthUser = {
    id: "local-user",
    email,
  };
  saveLocalUser(localUser);
  return { user: localUser };
};

export const signOut = async () => {
  if (API_BASE) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return;
  }
  saveLocalUser(null);
};

export const updateProfile = async (payload: {
  fullName: string;
  company: string;
  avatarUrl: string;
}): Promise<AuthUser> => {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await readJsonBody<{ message?: string; user?: AuthUser }>(res);
    if (!res.ok) {
      throw new Error(data.message ?? "Could not update profile");
    }
    return data.user as AuthUser;
  }

  const raw = localStorage.getItem(USER_KEY);
  const current = raw ? (JSON.parse(raw) as AuthUser) : null;
  const merged: AuthUser = {
    id: current?.id ?? "local-user",
    email: current?.email ?? "local@example.com",
    billingTier: current?.billingTier ?? "free",
    fullName: payload.fullName,
    company: payload.company,
    avatarUrl: payload.avatarUrl,
  };
  saveLocalUser(merged);
  return merged;
};
