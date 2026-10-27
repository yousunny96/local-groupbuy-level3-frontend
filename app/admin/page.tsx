"use client";

import Link from "next/link";
import { useState } from "react";
import { Notice } from "@/components/ui";
import { api, ApiError, type Stats } from "@/lib/api";
import { Guard } from "@/lib/auth";
import { useFetch } from "@/lib/useFetch";

export default function AdminPage() {
  return (
    <Guard role="admin">
      <Admin />
    </Guard>
  );
}

function Admin() {
  const { data, error, reload } = useFetch<Stats>("/stats");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [ai, setAi] = useState<{ summary: string; createdAt: string } | null>(null);

  async function seed() {
    if (!window.confirm("지금 있는 공동구매와 신청이 모두 지워지고, 가상 데이터로 새로 채워져요. 계속할까요?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await api<{ groupBuys: number; orders: number; cancelledOrders: number }>("/seed", { method: "POST" });
      setMsg({
        kind: "ok",
        text: `새로 채웠어요: 공동구매 ${r.groupBuys}개, 신청 ${r.orders}건, 취소 ${r.cancelledOrders}건`,
      });
      setAi(null);
      reload();
    } catch (e) {
      setMsg({ kind: "error", text: (e as ApiError).message });
    } finally {
      setBusy(false);
    }
  }

  async function summarize() {
    setAiBusy(true);
    setAiError("");
    try {
      setAi(await api<{ summary: string; createdAt: string }>("/admin/ai/summary", { method: "POST" }));
    } catch (e) {
      setAiError((e as ApiError).message);
    } finally {
      setAiBusy(false);
    }
  }

  const tiles = [
    { label: "진행 중인 공동구매", value: data?.openGroupBuys, unit: "개" },
    { label: "지금 신청된 박스", value: data?.orderedBoxes, unit: "박스" },
    { label: "신청한 사람", value: data?.applicants, unit: "명" },
  ];

  return (
    <>
      <h1>현황</h1>
      <p className="sub">취소된 신청은 숫자에 들어 있지 않아요.</p>
      {error && <Notice>{error}</Notice>}
      <div className="tiles">
        {tiles.map((t) => (
          <div className="tile" key={t.label}>
            <div className="tile-label">{t.label}</div>
            <div className="tile-num">
              {t.value ?? "–"}
              <small>{t.unit}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="row between">
          <h2>AI 현황 요약</h2>
          <span className="badge green">GPT</span>
        </div>
        <p className="muted">
          버튼을 누르면 AI가 지금 신청 현황을 읽고, 주목할 공동구매와 오늘 할 일을 쉬운 말로 정리해 줘요. 상품 이름과 박스 수만 보내고,
          신청한 분의 이름·연락처는 보내지 않아요.
        </p>
        {aiError && <Notice>{aiError}</Notice>}
        {ai && (
          <div className="ai-box" aria-live="polite">
            <div className="ai-text">{ai.summary}</div>
            <div className="small muted">AI가 만든 글이에요. 숫자는 위 현황과 함께 확인해 주세요.</div>
          </div>
        )}
        <div className="row gap">
          <button className="btn primary" onClick={summarize} disabled={aiBusy}>
            {aiBusy ? "AI가 읽고 있어요… (몇 초 걸려요)" : ai ? "다시 요약하기" : "AI로 현황 요약하기"}
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>가상 데이터 다시 채우기</h2>
        <p className="muted">
          시연할 때 쓰는 버튼이에요. 모든 공동구매와 신청을 지우고 가상 데이터로 새로 채워요. 확인용 계정(관리자·일반)도 다시 만들어져요.
          이름과 연락처도 모두 지어낸 값이에요.
        </p>
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        <div className="row gap">
          <button className="btn primary" onClick={seed} disabled={busy}>
            {busy ? "채우는 중…" : "가상 데이터 채우기"}
          </button>
          <Link href="/admin/orders" className="btn ghost">신청 목록 보기</Link>
        </div>
      </div>
    </>
  );
}
