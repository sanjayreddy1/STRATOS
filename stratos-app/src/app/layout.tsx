import type { Metadata, Viewport } from "next";
import { Syncopate, Unbounded, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const syncopate = Syncopate({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-syncopate",
  display: "swap",
});

const unbounded = Unbounded({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "STRATOS",
  description: "Train like an officer.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "STRATOS",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0D0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syncopate.variable} ${unbounded.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-dvh bg-background text-text font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="stratos-theme"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
