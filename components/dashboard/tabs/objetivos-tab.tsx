import { Card } from "@/components/design-system/card";
import { Badge } from "@/components/design-system/badge";
import { PRAZO_LABELS, type Prazo } from "@/lib/wizard/schema";
import { capacidadeInvestimento, impactoObjetivos, projecaoMetaComInflacao } from "@/lib/calculos";
import { adicionarObjetivo, removerObjetivo } from "@/app/carteira/[clientId]/actions";
import { resolverAssumptions } from "@/lib/assumptions";
import { formatarMoeda } from "@/lib/format";
import type { Assumptions, Cliente, Objetivo } from "@/lib/types/cliente";

type ObjetivosTabProps = {
  objetivos: Objetivo[];
  assumptions: Assumptions | null;
  cliente: Cliente;
};

const ORDEM_PRAZO: Prazo[] = ["curto", "medio", "longo"];
const BADGE_TONE: Record<Prazo, "blue" | "gold" | "green"> = {
  curto: "blue",
  medio: "gold",
  longo: "green",
};

export function ObjetivosTab({ objetivos, assumptions, cliente }: ObjetivosTabProps) {
  const { inflacaoProjetadaPct } = resolverAssumptions(assumptions);
  const capacidadeAtual =
    cliente.renda_mensal != null && cliente.despesa_mensal != null
      ? capacidadeInvestimento(cliente.renda_mensal, cliente.despesa_mensal)
      : 0;
  const impacto = impactoObjetivos(
    objetivos,
    capacidadeAtual,
    cliente.patrimonio_investido ?? 0,
    inflacaoProjetadaPct,
  );

  if (objetivos.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormNovoObjetivo clientId={cliente.id} />
        <Card className="md:col-span-3">
          <p className="text-sm text-ink-60">
            Nenhum objetivo cadastrado para este cliente ainda.
          </p>
        </Card>
      </div>
    );
  }

  const grupos = ORDEM_PRAZO.map((prazo) => ({
    prazo,
    itens: objetivos.filter((o) => o.prazo === prazo),
  })).filter((grupo) => grupo.itens.length > 0);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <FormNovoObjetivo clientId={cliente.id} />
      <ImpactoObjetivos impacto={impacto} />
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
                  <form action={removerObjetivo} className="mt-4">
                    <input type="hidden" name="clientId" value={cliente.id} />
                    <input type="hidden" name="objetivoId" value={objetivo.id} />
                    <button type="submit" className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                      Remover objetivo
                    </button>
                  </form>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}


function FormNovoObjetivo({ clientId }: { clientId: string }) {
  return (
    <Card className="md:col-span-3">
      <p className="mb-3 font-display text-[15px] font-semibold text-navy">Adicionar objetivo</p>
      <form action={adicionarObjetivo} className="grid grid-cols-1 gap-3 text-sm md:grid-cols-5">
        <input type="hidden" name="clientId" value={clientId} />
        <input name="descricao" required placeholder="Descrição" className="rounded-xl border border-line px-3 py-2 md:col-span-2" />
        <select name="prazo" defaultValue="medio" className="rounded-xl border border-line px-3 py-2">
          {ORDEM_PRAZO.map((prazo) => (
            <option key={prazo} value={prazo}>{PRAZO_LABELS[prazo]}</option>
          ))}
        </select>
        <input type="number" name="valor_estimado" min="0" step="100" placeholder="Valor" className="rounded-xl border border-line px-3 py-2" />
        <input type="number" name="horizonte_anos" min="0" step="1" placeholder="Anos" className="rounded-xl border border-line px-3 py-2" />
        <button type="submit" className="rounded-full bg-navy px-4 py-2 font-semibold text-white md:col-start-5">Salvar objetivo</button>
      </form>
    </Card>
  );
}

function ImpactoObjetivos({ impacto }: { impacto: ReturnType<typeof impactoObjetivos> }) {
  return (
    <Card className="md:col-span-3">
      <p className="mb-3 font-display text-[15px] font-semibold text-navy">Impacto dos objetivos</p>
      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-4">
        <div><span className="text-ink-60">Total futuro</span><b className="block text-navy">{formatarMoeda(impacto.totalObjetivos)}</b></div>
        <div><span className="text-ink-60">Aporte mensal pros objetivos</span><b className="block text-navy">{formatarMoeda(impacto.aporteMensalObjetivos)}</b></div>
        <div><span className="text-ink-60">Capacidade após objetivos</span><b className={impacto.capacidadeRestante >= 0 ? "block text-green-ink" : "block text-gold-ink"}>{formatarMoeda(impacto.capacidadeRestante)}</b></div>
        <div><span className="text-ink-60">Patrimônio após objetivos</span><b className={impacto.patrimonioDepoisObjetivos >= 0 ? "block text-navy" : "block text-gold-ink"}>{formatarMoeda(impacto.patrimonioDepoisObjetivos)}</b></div>
      </div>
    </Card>
  );
}
