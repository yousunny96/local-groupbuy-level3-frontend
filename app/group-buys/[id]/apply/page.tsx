"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Field, Notice } from "@/components/ui";
import { api, ApiError, type GroupBuy } from "@/lib/api";
import { Guard, useAuth } from "@/lib/auth";
import { phoneText, timeLeft, won } from "@/lib/format";
import { useFetch } from "@/lib/useFetch";

interface Done {
  orderCode: string;
  name: string;
  phone: string;
  boxes: number;
  totalPrice: number;
  groupBuyTitle: string;
}

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Guard>
      <Apply id={id} />
    </Guard>
  );
}

function Apply({ id }: { id: string }) {
  const { user } = useAuth();
  const { data: g, error, loading, reload } = useFetch<GroupBuy>(`/group-buys/${id}`);
  const [boxes, setBoxes] = useState("1");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Done | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setFieldErr({});
    try {
      const o = await api<Done>("/orders", { method: "POST", body: { groupBuyId: Number(id), boxes } });
      setDone(o);
      setBoxes("1");
    } catch (err) {
      const e2 = err as ApiError;
      setMsg(e2.message);
      setFieldErr(e2.errors ?? {});
      reload(); // 남은 수량이 바뀌었을 수 있어서 다시 불러온다
    } finally {
      setBusy(false);
    }
  }

  if (error) return <Notice>{error}</Notice>;
  if (loading || !g) return <p className="muted">불러오는 중이에요…</p>;

  if (done) {
    return (
      <div className="panel center">
        <div className="check" aria-hidden>✓</div>
        <h1>신청이 완료됐어요</h1>
        <p className="muted">신청번호는 &lsquo;내 신청&rsquo;에서도 볼 수 있고, 거기서 취소할 수 있어요.</p>
        <div className="code">{done.orderCode}</div>
        <dl className="facts left">
          <div>
            <dt>상품</dt>
            <dd>{done.groupBuyTitle}</dd>
          </div>
          <div>
            <dt>신청자</dt>
            <dd>
              {done.name} ({phoneText(done.phone)})
            </dd>
          </div>
          <div>
            <dt>수량</dt>
            <dd>
              {done.boxes}박스 · {won(done.totalPrice)} (결제는 하지 않아요)
            </dd>
          </div>
        </dl>
        <div className="row gap center">
          <Link href="/" className="btn primary">공동구매 더 보기</Link>
          <Link href="/my" className="btn ghost">내 신청 보기</Link>
        </div>
      </div>
    );
  }

  const closed = g.status === "마감";
  return (
    <>
      <Link href={`/group-buys/${g.id}`} className="back">← 상세로 돌아가기</Link>
      <div className="panel narrow">
        <h1>{g.title} 신청</h1>
        <p className="muted">
          {closed
            ? "마감된 공동구매예요."
            : `남은 ${g.remainingBoxes}박스 · 1인 최대 ${g.maxPerPerson}박스 · ${timeLeft(g.deadline)}`}
        </p>

        {msg && <Notice>{msg}</Notice>}

        <dl className="facts left">
          <div>
            <dt>신청자</dt>
            <dd>
              {user?.name} ({phoneText(user?.phone ?? "")}) <span className="muted small">· 로그인한 계정 정보로 신청돼요</span>
            </dd>
          </div>
        </dl>

        <form onSubmit={submit} noValidate>
          <Field label="박스 수" error={fieldErr.boxes} hint="내 계정으로 신청한 박스는 합쳐서 1인 한도를 세요.">
            <input
              type="number"
              min={1}
              value={boxes}
              onChange={(e) => setBoxes(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <button className="btn primary wide" disabled={busy || closed || g.soldOut}>
            {busy ? "신청하는 중…" : closed ? "마감됐어요" : g.soldOut ? "남은 수량이 없어요" : "신청하기"}
          </button>
        </form>
      </div>
    </>
  );
}
