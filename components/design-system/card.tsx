import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** "navy" reproduz o card escuro de destaque (ex: "Patrimônio total" no HTML de referência). */
  tone?: "default" | "navy";
};

// Card base do design system (reference/Planejamento-Priscila.html .card):
// fundo branco, borda sutil, cantos grandes, sombra leve com lift no hover.
export function Card({ children, className = "", tone = "default" }: CardProps) {
  const toneClass =
    tone === "navy"
      ? "border-navy bg-navy text-white"
      : "border-line bg-white text-ink";

  return (
    <div
      className={`rounded-card border p-7 shadow-brand-sm transition-shadow duration-300 hover:shadow-brand-md ${toneClass} ${className}`}
    >
      {children}
    </div>
  );
}

// Rótulo pequeno em caixa alta usado no topo dos cards (.card-label).
export function CardLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mb-2.5 flex items-center gap-2 text-[11.5px] font-bold tracking-[0.1em] text-ink-40 uppercase ${className}`}
    >
      {children}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  note?: string;
  /** Cor da barra de destaque à esquerda (.stat-card::after / --accent). */
  accent?: "blue" | "green" | "gold" | "navy" | "muted";
};

const ACCENT_CLASS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  blue: "before:bg-blue",
  green: "before:bg-green",
  gold: "before:bg-gold",
  navy: "before:bg-navy",
  muted: "before:bg-ink-40",
};

// Cartão de indicador numérico (reference .stat-card): valor em destaque na
// tipografia display, com uma barra de cor à esquerda indicando a categoria.
export function StatCard({ label, value, note, accent = "blue" }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-card border border-line bg-white p-6 shadow-brand-sm before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:content-[''] ${ACCENT_CLASS[accent]}`}
    >
      <div className="mb-2.5 text-[12.5px] font-semibold text-ink-60">{label}</div>
      <div className="font-display text-[32px] font-semibold text-navy">
        {value}
      </div>
      {note && <div className="mt-1.5 text-xs text-ink-40">{note}</div>}
    </div>
  );
}
