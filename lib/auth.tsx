"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken, type User } from "./api";

interface AuthState {
  user: User | null;
  /** 로그인 상태 확인이 끝났는지 (끝나기 전에는 로그인 화면으로 보내지 않는다) */
  ready: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api<User>("/auth/me")
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("gb-logout", onLogout);
    return () => window.removeEventListener("gb-logout", onLogout);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const r = await api<{ token: string; user: User }>("/auth/login", { method: "POST", body: { username, password } });
    setToken(r.token);
    setUser(r.user);
    return r.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider 안에서만 쓸 수 있어요.");
  return v;
}

/**
 * 화면 가드. 로그인이 필요한 화면, 관리자만 볼 수 있는 화면을 감싼다.
 * (화면에서 막는 것은 안내용이다. 진짜 막는 일은 백엔드가 한다)
 */
export function Guard({ role, children }: { role?: "admin"; children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) {
      const next = window.location.pathname;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [ready, user, router]);

  if (!ready || !user) return <p className="muted">로그인 상태를 확인하고 있어요…</p>;
  if (role === "admin" && user.role !== "admin") {
    return (
      <div className="panel narrow center">
        <h1>관리자만 볼 수 있어요</h1>
        <p className="muted">{user.name}님은 일반 사용자 계정이에요. 이 화면은 관리자 계정으로 로그인해야 열려요.</p>
        <div className="row gap center">
          <Link href="/" className="btn primary">공동구매 보기</Link>
          <Link href="/my" className="btn ghost">내 신청 보기</Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
