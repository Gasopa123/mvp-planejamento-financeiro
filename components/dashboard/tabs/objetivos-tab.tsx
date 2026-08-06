import { Card } from "@/components/design-system/card";
import { Badge } from "@/components/design-system/badge";
import { PRAZO_LABELS, type Prazo } from "@/lib/wizard/schema";
import { projecaoMetaComInflacao } from "@/lib/calculos";
import { resolverAssumptions } from "@/lib/assumptions";
import { formatarMoeda } from "@/lib/format";
import type { Assumptions, Objetivo } from "@/lib/types/cliente";

type ObjetivosTabProps = {
  objetivos: Objetivo[];
  assumptions: Assumptions | null;
};

const ORDEM_PRAZO: Prazo[] = ["curto", "medio", "longo"];
const BADGE_TONE: Record<Prazo, "blue" | "gold" | "green"> = {
  curto: "blue",
  medio: "gold",
  longo: "green",
};

export function ObjetivosTab({ objetivos, assumptions }: ObjetivosTabProps) {
  const { inflacaoProjetadaPct } = resolverAssumptions(assumptions);

  if (objetivos.length === 0) {
    return (
      <Card>
        <p className="text-sm text-ink-60">
          Nenhum objetivo cadastrado para este cliente ainda.
        </p>
      </Card>
    );
  }

  const grupos = ORDEM_PRAZO.map((prazo) => ({
    prazo,
    itens: objetivos.filter((o) => o.prazo === prazo),
  })).filter((grupo) => grupo.itens.length > 0);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {grupos.map((grupo) => (
        <div key={grupo.prazo}>
          <Badge tone={BADGE_TONE[grupo.prazo]} className="mb-3">
            {PRAZO_LABELS[grupo.prazo]}
          </Badge>

          <div className="space-y-4">
            {grupo.itens.map((objetivo) => {
              const valorFuturo =
                objetivo.valor_estimado != null
                  ? projecaoMetaComInflacao(
                      objetivo.valor_estimado,
                      inflacaoProjetadaPct,
                      objetivo.horizonte_anos ?? 0,
                    )
                  : null;

              return (
                <Card key={objetivo.id}>
                  <p className="mb-3 font-display text-[15px] font-semibold text-navy">
                    {objetivo.descricao}
                  </p>
                  {objetivo.valor_estimado != null && (
                    <div className="flex justify-between text-[13px] text-ink-60">
                      <span>Valor hoje</span>
                      <b className="text-navy">
                        {formatarMoeda(objetivo.valor_estimado)}
                      </b>
                    </div>
                  )}
                  {valorFuturo != null && (
                    <div className="mt-1.5 flex justify-between text-[13px] text-ink-60">
                      <span>
                        Corrigido pela inflação
                        {objetivo.horizonte_anos != null &&
                          ` (${objetivo.horizonte_anos} anos)`}
                      </span>
                      <b className="text-gold-ink">{formatarMoeda(valorFuturo)}</b>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
