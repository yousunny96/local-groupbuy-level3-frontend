"use client";

import Link from "next/link";
import { useState } from "react";
import { Notice, Progress, StatusBadge } from "@/components/ui";
import type { GroupBuy } from "@/lib/api";
import { dateTime, timeLeft, won } from "@/lib/format";
import { useFetch } from "@/lib/useFetch";

export default function Home() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [origin, setOrigin] = useState("");
  const [status, setStatus] = useState("");

  const opts = useFetch<{ categories: string[]; origins: string[] }>("/group-buys/options");
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  if (origin) params.set("origin", origin);
  if (status) params.set("status", status);
  const list = useFetch<GroupBuy[]>(`/group-buys?${params}`);

  const filtered = Boolean(q || category || origin || status);

  return (
    <>
      <h1>제철 농산물 공동구매</h1>
      <p className="sub">마음에 드는 공동구매를 골라 박스 수만 정해서 신청하세요. 마감 전까지는 언제든 취소할 수 있어요.</p>

      <div className="filters" role="search">
        <input
          type="search"
          placeholder="상품 이름으로 찾기 (예: 사과)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="상품 이름 검색"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="종류">
          <option value="">종류 전체</option>
          {opts.data?.categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={origin} onChange={(e) => setOrigin(e.target.value)} aria-label="산지">
          <option value="">산지 전체</option>
          {opts.data?.origins.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="상태">
          <option value="">상태 전체</option>
          <option>진행중</option>
          <option>마감</option>
        </select>
        {filtered && (
          <button
            className="btn ghost"
            onClick={() => {
              setQ("");
              setCategory("");
              setOrigin("");
              setStatus("");
            }}
          >
            필터 지우기
          </button>
        )}
      </div>

      {list.error && <Notice>{list.error}</Notice>}
      {list.loading && !list.data && <p className="muted">불러오는 중이에요…</p>}
      {list.data && list.data.length === 0 && (
        <div className="empty">
          {filtered ? "조건에 맞는 공동구매가 없어요. 필터를 바꿔 보세요." : "아직 등록된 공동구매가 없어요."}
        </div>
      )}

      <div className="grid">
        {list.data?.map((g) => (
          <Link key={g.id} href={`/group-buys/${g.id}`} className={`card ${g.status === "마감" ? "dim" : ""}`}>
            <div className="row between">
              <span className="chip">
                {g.category} · {g.origin}
              </span>
              <StatusBadge g={g} />
            </div>
            <h2>{g.title}</h2>
            <div className="price">
              {won(g.pricePerBox)} <small>/ 박스</small>
            </div>
            <Progress g={g} />
            <div className="row between small">
              <span>
                {g.orderedBoxes} / {g.totalBoxes}박스 신청
              </span>
              <strong>{g.soldOut ? "남은 수량 없음" : `남은 ${g.remainingBoxes}박스`}</strong>
            </div>
            <div className="small muted">
              {g.status === "마감" ? `${dateTime(g.deadline)} 마감` : `${timeLeft(g.deadline)} · 1인 최대 ${g.maxPerPerson}박스`}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
