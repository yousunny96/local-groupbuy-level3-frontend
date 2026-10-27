"use client";

import Link from "next/link";
import { useState } from "react";
import { Notice } from "@/components/ui";
import { api, ApiError, type Order } from "@/lib/api";
import { Guard, useAuth } from "@/lib/auth";
import { dateTime } from "@/lib/format";
import { useFetch } from "@/lib/useFetch";

export default function MyOrdersPage() {
  return (
    <Guard>
      <MyOrders />
    </Guard>
  );
}

function MyOrders() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useFetch<Order[]>("/my/orders");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function cancel(o: Order) {
    if (!window.confirm(`${o.groupBuyTitle} ${o.boxes}박스 신청을 취소할까요?`)) return;
    setBusy(o.orderCode);
    setMsg(null);
    try {
      await api("/orders/cancel", { method: "POST", body: { orderCode: o.orderCode } });
      setMsg({ kind: "ok", text: `${o.groupBuyTitle} 신청을 취소했어요. 그 수량은 다른 분이 다시 신청할 수 있어요.` });
      reload();
    } catch (e) {
      setMsg({ kind: "error", text: (e as ApiError).message });
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <h1>내 신청</h1>
      <p className="sub">
        {user?.name}님이 신청한 내역만 보여요. 마감 전까지는 여기서 바로 취소할 수 있어요.
      </p>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {error && <Notice>{error}</Notice>}
      {loading && !data && <p className="muted">불러오는 중이에요…</p>}
      {data && data.length === 0 && (
        <div className="empty">
          아직 신청한 공동구매가 없어요. <Link href="/" className="link">공동구매 보러 가기</Link>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>신청번호</th>
                <th>공동구매</th>
                <th className="num">박스</th>
                <th>상태</th>
                <th>신청 시각</th>
                <th aria-label="취소" />
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <tr key={o.id} className={o.status === "취소" ? "cancelled" : ""}>
                  <td className="mono">{o.orderCode}</td>
                  <td>
                    <Link href={`/group-buys/${o.groupBuyId}`} className="link">{o.groupBuyTitle}</Link>
                  </td>
                  <td className="num">{o.boxes}</td>
                  <td>
                    <span className={`badge ${o.status === "신청" ? "green" : "gray"}`}>{o.status}</span>
                  </td>
                  <td>{dateTime(o.createdAt)}</td>
                  <td>
                    {o.status === "신청" &&
                      (o.canCancel ? (
                        <button className="btn danger sm" disabled={busy === o.orderCode} onClick={() => cancel(o)}>
                          {busy === o.orderCode ? "취소 중…" : "취소"}
                        </button>
                      ) : (
                        <span className="small muted">마감됨</span>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="small muted" style={{ marginTop: 12 }}>결제는 하지 않고 신청만 받아요.</p>
    </>
  );
}
