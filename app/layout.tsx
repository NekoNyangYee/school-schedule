import { Header } from "@/Components/header/Header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StyledContent from "./style";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "청운중학교 통합 알리미",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledContent >
          <Header />
          {children}
        </StyledContent>
      </body>
    </html>
  );
}
