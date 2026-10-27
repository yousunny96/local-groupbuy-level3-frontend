"use client";

import { useState } from "react";
import { Notice } from "@/components/ui";
import type { GroupBuy, Order } from "@/lib/api";
import { Guard } from "@/lib/auth";
import { dateTime, phoneText } from "@/lib/format";
import { useFetch } from "@/lib/useFetch";

export default function OrdersPage() {
  return (
    <Guard role="admin">
      <Orders />
    </Guard>
  );
}

function Orders() {
  const [q, setQ] = useState("");
  const [gb, setGb] = useState("");
  const [status, setStatus] = useState("");

  const groups = useFetch<GroupBuy[]>("/group-buys");
  const p = new URLSearchParams();
  if (q.trim()) p.set("q", q.trim());
  if (gb) p.set("groupBuyId", gb);
  if (status) p.set("status", status);
  const { data, error, loading } = useFetch<Order[]>(`/orders?${p}`);

  return (
    <>
      <h1>신청 목록</h1>
      <p className="sub">모든 사용자의 신청이에요. 이름, 연락처, 신청번호로 찾을 수 있어요.</p>
      <div className="filters">
        <input
          type="search"
          placeholder="이름·연락처·신청번호 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="신청 검색"
        />
        <select value={gb} onChange={(e) => setGb(e.target.value)} aria-label="공동구매">
          <option value="">공동구매 전체</option>
          {groups.data?.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="상태">
          <option value="">상태 전체</option>
          <option>신청</option>
          <option>취소</option>
        </select>
      </div>

      {error && <Notice>{error}</Notice>}
      {loading && !data && <p className="muted">불러오는 중이에요…</p>}
      {data && <p className="muted small">{data.length}건</p>}
      {data && data.length === 0 && <div className="empty">조건에 맞는 신청이 없어요.</div>}

      {data && data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>신청번호</th>
                <th>공동구매</th>
                <th>이름</th>
                <th>연락처</th>
                <th className="num">박스</th>
                <th>상태</th>
                <th>신청 시각</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <tr key={o.id} className={o.status === "취소" ? "cancelled" : ""}>
                  <td className="mono">{o.orderCode}</td>
                  <td>{o.groupBuyTitle}</td>
                  <td>{o.name}</td>
                  <td>{phoneText(o.phone)}</td>
                  <td className="num">{o.boxes}</td>
                  <td>
                    <span className={`badge ${o.status === "신청" ? "green" : "gray"}`}>{o.status}</span>
                  </td>
                  <td>{dateTime(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
