import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "동네장터 공동구매",
  description: "제철 농산물 공동구매를 신청하고 취소하세요",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning>
        <AuthProvider>
          <Suspense fallback={<div className="nav" style={{ height: 52 }} />}>
            <Nav />
          </Suspense>
          <main>{children}</main>
        </AuthProvider>
        <footer className="foot">모든 이름·연락처·계정은 가상 데이터예요. 결제는 하지 않고 신청만 받아요.</footer>
      </body>
    </html>
  );
}
