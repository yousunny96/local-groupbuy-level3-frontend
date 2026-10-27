"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, Notice } from "@/components/ui";
import { api, ApiError, type GroupBuy } from "@/lib/api";
import { Guard } from "@/lib/auth";

const empty = { title: "", category: "과일", origin: "", pricePerBox: "", totalBoxes: "", maxPerPerson: "3", deadline: "" };

export default function NewGroupBuyPage() {
  return (
    <Guard role="admin">
      <NewGroupBuy />
    </Guard>
  );
}

function NewGroupBuy() {
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<GroupBuy | null>(null);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setFieldErr({});
    try {
      const deadline = f.deadline ? new Date(f.deadline).toISOString() : "";
      const g = await api<GroupBuy>("/group-buys", { method: "POST", body: { ...f, deadline } });
      setCreated(g);
      setF(empty);
    } catch (err) {
      const e2 = err as ApiError;
      setMsg(e2.message);
      setFieldErr(e2.errors ?? {});
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <div className="panel center narrow">
        <div className="check" aria-hidden>✓</div>
        <h1>공동구매를 등록했어요</h1>
        <p>{created.title} · 총 {created.totalBoxes}박스</p>
        <div className="row gap center">
          <Link href={`/group-buys/${created.id}`} className="btn primary">등록한 공동구매 보기</Link>
          <button className="btn ghost" onClick={() => setCreated(null)}>하나 더 등록</button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel narrow">
      <h1>공동구매 등록</h1>
      {msg && <Notice>{msg}</Notice>}
      <form onSubmit={submit} noValidate>
        <Field label="상품 이름" error={fieldErr.title}>
          <input value={f.title} onChange={set("title")} placeholder="예: 충주 햇사과 5kg" />
        </Field>
        <div className="two">
          <Field label="종류" error={fieldErr.category}>
            <select value={f.category} onChange={set("category")}>
              <option>과일</option>
              <option>채소</option>
              <option>곡물</option>
              <option>기타</option>
            </select>
          </Field>
          <Field label="산지" error={fieldErr.origin}>
            <input value={f.origin} onChange={set("origin")} placeholder="예: 충주" />
          </Field>
        </div>
        <div className="two">
          <Field label="박스당 가격(원)" error={fieldErr.pricePerBox}>
            <input type="number" min={1} value={f.pricePerBox} onChange={set("pricePerBox")} inputMode="numeric" />
          </Field>
          <Field label="총 박스 수" error={fieldErr.totalBoxes}>
            <input type="number" min={1} value={f.totalBoxes} onChange={set("totalBoxes")} inputMode="numeric" />
          </Field>
        </div>
        <Field label="1인 최대 박스 수" error={fieldErr.maxPerPerson} hint="한 분이 신청할 수 있는 최대 수량이에요.">
          <input type="number" min={1} value={f.maxPerPerson} onChange={set("maxPerPerson")} inputMode="numeric" />
        </Field>
        <Field label="마감 시간" error={fieldErr.deadline}>
          <input type="datetime-local" value={f.deadline} onChange={set("deadline")} />
        </Field>
        <button className="btn primary wide" disabled={busy}>
          {busy ? "등록하는 중…" : "등록하기"}
        </button>
      </form>
    </div>
  );
}
