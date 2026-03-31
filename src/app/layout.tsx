import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "東明社宅租金差異比較",
  description:
    "115 年東明社會住宅：各所得級距租金與定價租金差額，以及續租 1.1 倍租金增幅一目了然。"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}

