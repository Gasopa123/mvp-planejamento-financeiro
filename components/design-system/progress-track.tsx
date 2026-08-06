type ProgressTrackProps = {
  /** 0 a 100. Valores fora da faixa são grampeados. */
  percent: number;
  className?: string;
};

// Barra de progresso (reference .progress-track / .progress-fill), com o
// mesmo gradiente azul→verde e transição suave ao mudar de valor.
export function ProgressTrack({ percent, className = "" }: ProgressTrackProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full bg-[#EDF1F7] ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue to-green transition-[width] duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
