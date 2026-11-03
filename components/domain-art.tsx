"use client";

// Generative cover art — one abstract SVG composition per BoK domain, sharing a
// single visual language (soft dual-tone gradient, fine geometry, film grain).
// Crisp at any size, zero image requests. The geometry fades out under the
// left-hand text zone so domain titles always stay legible, and the whole piece
// steps down in dark mode where saturated tints read heavier.

import { useId } from "react";
import { cn } from "@/lib/utils";

export type DomainCode = "I" | "II" | "III" | "IV" | "V";

const THEMES: Record<DomainCode, { a: string; b: string; ink: string }> = {
  I: { a: "#16a34a", b: "#0ea5e9", ink: "#16a34a" }, // foundations — green/sky
  II: { a: "#2563eb", b: "#7c3aed", ink: "#2563eb" }, // laws — blue/violet
  III: { a: "#d97706", b: "#dc2626", ink: "#d97706" }, // development — amber/red
  IV: { a: "#0d9488", b: "#2563eb", ink: "#0d9488" }, // deployment — teal/blue
  V: { a: "#be185d", b: "#7c3aed", ink: "#be185d" }, // compliance practice — rose/violet
};

export function DomainArt({ code, className, opacity = 1 }: { code: DomainCode; className?: string; opacity?: number }) {
  const id = useId().replace(/[:]/g, "");
  const t = THEMES[code] ?? THEMES.I;
  return (
    <svg
      viewBox="0 0 640 160"
      preserveAspectRatio="xMidYMid slice"
      className={cn("dark:opacity-75", className)}
      aria-hidden
      style={opacity !== 1 ? { opacity } : undefined}
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={t.a} stopOpacity="0.16" />
          <stop offset="100%" stopColor={t.b} stopOpacity="0.10" />
        </linearGradient>
        <radialGradient id={`r-${id}`} cx="82%" cy="18%" r="70%">
          <stop offset="0%" stopColor={t.b} stopOpacity="0.22" />
          <stop offset="100%" stopColor={t.b} stopOpacity="0" />
        </radialGradient>
        {/* Text-zone fades: headers set their title bottom-left and progress
            bottom-right, so geometry is full only in the upper right. */}
        <linearGradient id={`fx-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="64%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <linearGradient id={`fy-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="46%" stopColor="#fff" stopOpacity="1" />
          <stop offset="76%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.22" />
        </linearGradient>
        <mask id={`mx-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="160">
          <rect width="640" height="160" fill={`url(#fx-${id})`} />
        </mask>
        <mask id={`my-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="160">
          <rect width="640" height="160" fill={`url(#fy-${id})`} />
        </mask>
        <filter id={`n-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.05 0" />
        </filter>
      </defs>

      <rect width="640" height="160" fill={`url(#g-${id})`} />
      <rect width="640" height="160" fill={`url(#r-${id})`} />

      <g mask={`url(#my-${id})`}>
      <g mask={`url(#mx-${id})`}>
        {code === "I" && (
          // Foundations: concentric arcs rising from a baseline — bedrock rings.
          <g fill="none" stroke={t.ink} strokeWidth="1.5">
            {[28, 56, 84, 112, 140].map((r, i) => (
              <circle key={r} cx="120" cy="170" r={r} strokeOpacity={0.34 - i * 0.055} />
            ))}
            <g strokeOpacity="0.35">
              {[420, 460, 500, 540, 580].map((x, i) => (
                <line key={x} x1={x} y1={130 - i * 14} x2={x + 26} y2={130 - i * 14} strokeWidth="3" strokeLinecap="round" />
              ))}
            </g>
            <circle cx="520" cy="52" r="5" fill={t.ink} fillOpacity="0.5" stroke="none" />
          </g>
        )}

        {code === "II" && (
          // Laws: column rhythm (statute lines) + a scale-beam arc.
          <g stroke={t.ink} fill="none">
            {Array.from({ length: 14 }, (_, i) => (
              <line key={i} x1={48 + i * 26} y1={i % 3 === 0 ? 34 : 48} x2={48 + i * 26} y2={126} strokeOpacity={i % 3 === 0 ? 0.38 : 0.18} strokeWidth={i % 3 === 0 ? 2 : 1.25} />
            ))}
            <path d="M 452 106 Q 520 34 588 106" strokeOpacity="0.42" strokeWidth="1.75" />
            <circle cx="452" cy="106" r="4.5" fill={t.ink} fillOpacity="0.55" stroke="none" />
            <circle cx="588" cy="106" r="4.5" fill={t.ink} fillOpacity="0.55" stroke="none" />
            <circle cx="520" cy="52" r="6" strokeOpacity="0.5" strokeWidth="1.75" />
          </g>
        )}

        {code === "III" && (
          // Development: waveform build — signal refining left to right.
          <g fill="none" stroke={t.ink} strokeWidth="1.75">
            <path d="M 24 96 q 24 -44 48 0 t 48 0 t 48 0 t 48 0" strokeOpacity="0.2" />
            <path d="M 240 96 q 24 -30 48 0 t 48 0 t 48 0" strokeOpacity="0.34" />
            <path d="M 456 96 q 24 -16 48 0 t 48 0" strokeOpacity="0.52" />
            <g fill={t.ink} stroke="none">
              {[72, 168, 288, 384, 504, 552].map((x, i) => (
                <circle key={x} cx={x} cy={96} r={2.5 + (i % 3)} fillOpacity="0.4" />
              ))}
            </g>
          </g>
        )}

        {code === "IV" && (
          // Deployment: dot-grid field with an ascending trajectory.
          <g>
            {Array.from({ length: 8 }, (_, r) =>
              Array.from({ length: 24 }, (_, c) => (
                <circle key={`${r}-${c}`} cx={40 + c * 24} cy={28 + r * 15} r="1.6" fill={t.ink} fillOpacity={0.10 + ((r + c) % 5) * 0.02} />
              ))
            )}
            <path d="M 60 128 C 220 128 300 96 400 64 S 580 28 596 24" fill="none" stroke={t.ink} strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
            <circle cx="596" cy="24" r="5" fill={t.ink} fillOpacity="0.7" />
          </g>
        )}

        {code === "V" && (
          // Compliance practice: a ledger of checked obligations under an
          // oversight seal — the day-to-day of applying the law.
          <g fill="none" stroke={t.ink}>
            <circle cx="96" cy="118" r="46" strokeOpacity="0.22" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
            <circle cx="96" cy="118" r="26" strokeOpacity="0.16" strokeWidth="1.25" />
            {[0, 1, 2, 3].map((i) => {
              const y = 34 + i * 20;
              const ticked = i < 3;
              return (
                <g key={i}>
                  <rect x="436" y={y - 6.5} width="13" height="13" rx="3.5" strokeOpacity="0.45" strokeWidth="1.5" fill={t.ink} fillOpacity={ticked ? 0.16 : 0} />
                  {ticked && <path d={`M 439 ${y} l 2.75 2.75 l 4.75 -5.5`} strokeOpacity="0.65" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
                  <line x1="460" y1={y} x2={460 + [104, 76, 118, 56][i]} y2={y} strokeOpacity={ticked ? 0.34 : 0.18} strokeWidth="3" strokeLinecap="round" />
                </g>
              );
            })}
            <circle cx="612" cy="18" r="28" strokeOpacity="0.2" strokeWidth="1.5" />
            <circle cx="612" cy="18" r="48" strokeOpacity="0.12" strokeWidth="1.25" />
          </g>
        )}
      </g>
      </g>

      <rect width="640" height="160" filter={`url(#n-${id})`} opacity="0.5" />
    </svg>
  );
}
