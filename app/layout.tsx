import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/app-shell";
import { ExamLight } from "@/components/exam-light";
import { DEFAULT_EXAM, EXAM_SLUGS } from "@/lib/exam-state";

const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz", "wdth"] });
const sans = Instrument_Sans({ variable: "--font-instrument", subsets: ["latin"], axes: ["wdth"] });

export const metadata: Metadata = {
  title: "AIGP Coach — structured prep for IAPP exams (AIGP · CIPP/E · CIPM)",
  description: "Learn each BoK domain by domain, drill IAPP-style questions, sit fixed mock papers, track your mastery, and know when you're ready. AIGP, CIPP/E and CIPM.",
};

// Applies the stored exam's light before first paint, so a CIPP/E session never
// flashes the default exam's colors. Allowlisted — the value is user storage.
const examLightScript = `try{var e=localStorage.getItem("coach-active-exam");document.documentElement.setAttribute("data-exam",${JSON.stringify(EXAM_SLUGS)}.indexOf(e)>-1?e:${JSON.stringify(DEFAULT_EXAM)})}catch(_){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: examLightScript }} />
      </head>
      <body className="min-h-full">
        <ExamLight />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
