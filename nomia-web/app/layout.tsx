import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import SmartCursor from "./components/ui/SmartCursor";
import { CursorProvider } from "./context/CursorContext";
import AtmosphereController from "./components/AtmosphereController";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOMIA // PARENT_OS",
  description: "Advanced Robotic Control System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-black text-white overflow-x-hidden cursor-none`}
      >
        <CursorProvider>
          <AtmosphereController />
          <SmoothScroll>
            {children}
          </SmoothScroll>
          <SmartCursor />
        </CursorProvider>

      </body>
    </html>
  );
}
