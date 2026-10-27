"use client";

import Link from "next/link";
import { use } from "react";
import { Notice, Progress, StatusBadge } from "@/components/ui";
import type { GroupBuy } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { dateTime, timeLeft, won } from "@/lib/format";
import { useFetch } from "@/lib/useFetch";

export default function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: g, error, loading } = useFetch<GroupBuy>(`/group-buys/${id}`);
  const { user, ready } = useAuth();

  if (error) {
    return (
      <>
        <Notice>{error}</Notice>
        <Link href="/" className="btn ghost">← 목록으로</Link>
      </>
    );
  }
  if (loading || !g) return <p className="muted">불러오는 중이에요…</p>;

  const canApply = g.status === "진행중" && !g.soldOut;
  return (
    <>
      <Link href="/" className="back">← 공동구매 목록</Link>
      <div className="panel">
        <div className="row between">
          <span className="chip">
            {g.category} · {g.origin}
          </span>
          <StatusBadge g={g} />
        </div>
        <h1>{g.title}</h1>
        <div className="price big">
          {won(g.pricePerBox)} <small>/ 박스</small>
        </div>

        <Progress g={g} />
        <div className="row between">
          <span>
            {g.orderedBoxes} / {g.totalBoxes}박스 신청 · 신청자 {g.applicants}명
          </span>
          <strong>{g.soldOut ? "남은 수량 없음" : `남은 ${g.remainingBoxes}박스`}</strong>
        </div>

        <dl className="facts">
          <div>
            <dt>마감</dt>
            <dd>
              {dateTime(g.deadline)} <span className="muted">({timeLeft(g.deadline)})</span>
            </dd>
          </div>
          <div>
            <dt>1인 최대</dt>
            <dd>{g.maxPerPerson}박스 (나눠서 신청해도 합쳐서 세요)</dd>
          </div>
          <div>
            <dt>취소</dt>
            <dd>마감 전까지 &lsquo;내 신청&rsquo;에서 취소할 수 있어요.</dd>
          </div>
        </dl>

        {canApply ? (
          ready && !user ? (
            <>
              <Notice kind="info">신청하려면 먼저 로그인해 주세요.</Notice>
              <Link href={`/login?next=${encodeURIComponent(`/group-buys/${g.id}/apply`)}`} className="btn primary wide">
                로그인하고 신청하기
              </Link>
            </>
          ) : (
            <Link href={`/group-buys/${g.id}/apply`} className="btn primary wide">
              신청하기
            </Link>
          )
        ) : (
          <Notice kind="info">
            {g.status === "마감" ? "마감된 공동구매예요. 더 이상 신청할 수 없어요." : "모두 신청되어 남은 수량이 없어요. 취소가 생기면 다시 열려요."}
          </Notice>
        )}
      </div>
    </>
  );
}
