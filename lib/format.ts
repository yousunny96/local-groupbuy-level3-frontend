export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export function phoneText(p: string) {
  if (p.length === 11) return `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
  if (p.length === 10) return `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
  return p;
}

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export function timeLeft(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "마감";
  const h = Math.floor(ms / 3600_000);
  if (h >= 24) return `${Math.floor(h / 24)}일 ${h % 24}시간 남음`;
  if (h >= 1) return `${h}시간 남음`;
  return `${Math.max(1, Math.floor(ms / 60_000))}분 남음`;
}
