export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const TOKEN_KEY = "gb_token";

/** 로그인하면 받는 "출입증". 이 브라우저에만 저장한다 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  errors: Record<string, string>;
  status: number;
  constructor(message: string, errors: Record<string, string> = {}, status = 0) {
    super(message);
    this.errors = errors;
    this.status = status;
  }
}

export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (init?.body) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method: init?.method ?? "GET",
      headers,
      body: init?.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("서버에 연결할 수 없어요. 잠시 뒤에 다시 시도해 주세요.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // 출입증이 만료되었거나 맞지 않으면 로그아웃 처리한다
    if (res.status === 401 && token) {
      setToken(null);
      window.dispatchEvent(new Event("gb-logout"));
    }
    throw new ApiError(
      data?.message ?? "문제가 생겼어요. 잠시 뒤에 다시 시도해 주세요.",
      data?.errors ?? {},
      res.status,
    );
  }
  return data as T;
}

export interface User {
  id: number;
  username: string;
  name: string;
  phone: string;
  role: "admin" | "user";
}

export interface GroupBuy {
  id: number;
  title: string;
  category: string;
  origin: string;
  pricePerBox: number;
  totalBoxes: number;
  maxPerPerson: number;
  deadline: string;
  orderedBoxes: number;
  remainingBoxes: number;
  applicants: number;
  status: "진행중" | "마감";
  soldOut: boolean;
}

export interface Order {
  id: number;
  orderCode: string;
  groupBuyId: number;
  groupBuyTitle: string;
  name: string;
  phone: string;
  boxes: number;
  status: "신청" | "취소";
  createdAt: string;
  cancelledAt: string | null;
  canCancel: boolean;
}

export interface Stats {
  openGroupBuys: number;
  orderedBoxes: number;
  applicants: number;
}
