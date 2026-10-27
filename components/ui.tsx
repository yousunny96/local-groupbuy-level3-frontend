import type { GroupBuy } from "@/lib/api";

export function Progress({ g }: { g: Pick<GroupBuy, "orderedBoxes" | "totalBoxes"> }) {
  const pct = Math.min(100, Math.round((g.orderedBoxes / g.totalBoxes) * 100));
  return (
    <div className="bar" role="img" aria-label={`${pct}% 신청됨`}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatusBadge({ g }: { g: Pick<GroupBuy, "status" | "soldOut"> }) {
  if (g.status === "마감") return <span className="badge gray">마감</span>;
  if (g.soldOut) return <span className="badge red">품절</span>;
  return <span className="badge green">진행중</span>;
}

export function Notice({ kind = "error", children }: { kind?: "error" | "ok" | "info"; children: React.ReactNode }) {
  return (
    <div className={`notice ${kind}`} role={kind === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="lbl">{label}</span>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="err">{error}</span>}
    </label>
  );
}
