import type { ReactNode } from "react";

type BadgeProps = {
  tone: "green" | "gold" | "blue";
  children: ReactNode;
  className?: string;
};

const TONE_CLASS: Record<BadgeProps["tone"], string> = {
  green: "bg-green-soft text-green-ink",
  gold: "bg-gold-soft text-gold-ink",
  blue: "bg-blue-soft text-blue",
};

// Pílula colorida (reference .badge).
export function Badge({ tone, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
