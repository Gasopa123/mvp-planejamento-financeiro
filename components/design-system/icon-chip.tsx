import type { ReactNode } from "react";

type IconChipProps = {
  tone?: "blue" | "green" | "gold";
  children: ReactNode;
  className?: string;
};

const TONE_CLASS: Record<NonNullable<IconChipProps["tone"]>, string> = {
  blue: "bg-blue-soft text-blue",
  green: "bg-green-soft text-green-ink",
  gold: "bg-gold-soft text-gold-ink",
};

// Círculo de ícone colorido (reference .icon-chip), usado no topo dos cards.
export function IconChip({ tone = "blue", children, className = "" }: IconChipProps) {
  return (
    <div
      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${TONE_CLASS[tone]} ${className}`}
    >
      <div className="h-[22px] w-[22px]">{children}</div>
    </div>
  );
}
