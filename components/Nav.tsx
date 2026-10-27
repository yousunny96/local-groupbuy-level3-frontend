"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const ADMIN = [
  { href: "/admin", label: "현황" },
  { href: "/admin/orders", label: "신청 목록" },
  { href: "/admin/group-buys/new", label: "공동구매 등록" },
];

export function Nav() {
  const path = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const on = (href: string) => (href === "/" ? path === "/" || path.startsWith("/group-buys") : path === href);

  const shopper = [{ href: "/", label: "공동구매" }, ...(user ? [{ href: "/my", label: "내 신청" }] : [])];

  return (
    <header className="nav">
      <div className="nav-in">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden>🥬</span> 동네장터 공동구매
        </Link>
        <nav aria-label="신청자 메뉴">
          {shopper.map((l) => (
            <Link key={l.href} href={l.href} className={on(l.href) ? "on" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        {user?.role === "admin" && (
          <nav className="admin" aria-label="관리자 메뉴">
            <span className="tag">관리자</span>
            {ADMIN.map((l) => (
              <Link key={l.href} href={l.href} className={on(l.href) ? "on" : ""}>
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <nav className={`account ${user?.role === "admin" ? "" : "push"}`} aria-label="계정">
          {!ready ? null : user ? (
            <>
              <span className="who">
                {user.name}님 <span className="tag">{user.role === "admin" ? "관리자" : "일반"}</span>
              </span>
              <button
                className="btn ghost sm"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/login" className="btn primary sm">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
