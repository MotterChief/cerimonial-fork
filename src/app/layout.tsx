import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import MainNavigation from "@/components/MainNavigation";
import { NotificationProvider } from "@/context/NotificationContext";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CerimoniasPro",
  description: "Sistema de Gestão para Cerimonialistas",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ClientLayoutWrapper>
                <div className="container">
                  <MainNavigation />
                  <main>{children}</main>
                </div>
              </ClientLayoutWrapper>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}