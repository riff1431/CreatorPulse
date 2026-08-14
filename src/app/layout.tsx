import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ThemeProvider } from "@/lib/extensions/theme-engine";
import { PluginProvider } from "@/lib/extensions/plugin-engine";
import { ToastProvider } from "@/components/ui/Toast";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CreatorPulse — Premium Creator Platform & Community",
  description: "A modern, elegant membership-based platform for creators, educators, coaches, and communities.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FFF9FC] text-[#18181B] selection:bg-[#FCE7F3] selection:text-[#DB2777]">
        <ThemeProvider>
          <PluginProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </PluginProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
