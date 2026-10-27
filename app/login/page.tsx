"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, Notice } from "@/components/ui";
import type { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const DEMO = [
  { label: "관리자 계정 채우기", username: "admin", password: "admin1234" },
  { label: "일반 사용자 계정 채우기", username: "user01", password: "user1234" },
];

export default function Login() {
  const { login, user, logout } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setFieldErr({});
    try {
      const u = await login(username, password);
      const next = new URLSearchParams(window.location.search).get("next");
      // 안전을 위해 이 사이트 안의 주소로만 돌아간다
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.replace(safeNext ?? (u.role === "admin" ? "/admin" : "/"));
    } catch (err) {
      const e2 = err as ApiError;
      setMsg(e2.message);
      setFieldErr(e2.errors ?? {});
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return (
      <div className="panel narrow center">
        <h1>이미 로그인했어요</h1>
        <p className="muted">
          {user.name}님 ({user.role === "admin" ? "관리자" : "일반 사용자"})으로 로그인되어 있어요.
        </p>
        <div className="row gap center">
          <button className="btn ghost" onClick={logout}>로그아웃</button>
          <button className="btn primary" onClick={() => router.push(user.role === "admin" ? "/admin" : "/")}>
            계속하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel narrow">
      <h1>로그인</h1>
      <p className="muted">공동구매를 신청하거나 내 신청을 보려면 로그인해 주세요.</p>
      {msg && <Notice>{msg}</Notice>}
      <form onSubmit={submit} noValidate>
        <Field label="아이디" error={fieldErr.username}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="예: user01"
            autoComplete="username"
            autoCapitalize="none"
          />
        </Field>
        <Field label="비밀번호" error={fieldErr.password}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        <button className="btn primary wide" disabled={busy}>
          {busy ? "로그인하는 중…" : "로그인"}
        </button>
      </form>

      <div className="demo">
        <p className="small muted">확인용 가상 계정이에요. 눌러서 입력칸을 채울 수 있어요.</p>
        <div className="row gap">
          {DEMO.map((d) => (
            <button
              key={d.username}
              type="button"
              className="btn ghost sm"
              onClick={() => {
                setUsername(d.username);
                setPassword(d.password);
                setMsg("");
                setFieldErr({});
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
