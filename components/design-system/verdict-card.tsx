import { IconCheck, IconWarning } from "./icons";
import { Badge } from "./badge";

type VerdictCardProps = {
  positivo: boolean;
  titulo: string;
  subtitulo: string;
  badgeLabel: string;
};

// Cartão de veredito (reference updateVerdict / #verdictCard): verde quando
// o plano se sustenta, dourado quando precisa de ajuste.
export function VerdictCard({ positivo, titulo, subtitulo, badgeLabel }: VerdictCardProps) {
  const toneClass = positivo
    ? "bg-green-soft border-[#c8ecd8]"
    : "bg-gold-soft border-[#f0e2b8]";
  const iconBg = positivo ? "bg-green" : "bg-gold";
  const titleColor = positivo ? "text-green-ink" : "text-gold-ink";

  return (
    <div className={`flex items-start gap-4 rounded-card border p-6 ${toneClass}`}>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${iconBg}`}>
        {positivo ? (
          <IconCheck className="h-[22px] w-[22px]" />
        ) : (
          <IconWarning className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className={`font-display text-lg font-semibold ${titleColor}`}>{titulo}</h3>
          <Badge tone={positivo ? "green" : "gold"}>{badgeLabel}</Badge>
        </div>
        <p className="mt-1.5 text-sm text-ink-60">{subtitulo}</p>
      </div>
    </div>
  );
}
