import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import PageWrapper from "./components/layouts/transition/transition";
import { getServerSession } from "next-auth";
import Providers from "./components/layouts/Providers/Providers";
import { authOptions } from "./api/auth/[...nextauth]/route";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Ticket",
  description: "E-Ticket by Sma Negeri 1 Madiun",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <ViewTransitions>
      <html lang="en">
        <body className={`${inter.variable}`}>
          <Providers session={session}>
            <PageWrapper>{children}</PageWrapper>
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
