import Link from "next/link";
import { Card, CardLabel } from "@/components/design-system/card";
import { PatrimonioEvolucaoChart } from "@/components/design-system/charts/patrimonio-evolucao-chart";
import { resolverAssumptions } from "@/lib/assumptions";
import {
  capacidadeInvestimento,
  compararCenariosAposentadoria,
  impactoObjetivos,
  reservaEmergenciaIdeal,
  scoreSaudePlano,
  simularEvolucaoPatrimonio,
} from "@/lib/calculos";
import { formatarMoeda } from "@/lib/format";
import type { Assumptions, Cliente, Objetivo } from "@/lib/types/cliente";

type PresentationDashboardProps = {
  cliente: Cliente;
  objetivos: Objetivo[];
  assumptions: Assumptions | null;
};

export function PresentationDashboard({ cliente, objetivos, assumptions }: PresentationDashboardProps) {
  const { rentabilidadeRealPadraoPct, inflacaoProjetadaPct } = resolverAssumptions(assumptions);
  const capacidade = capacidadeInvestimento(cliente.renda_mensal ?? 0, cliente.despesa_mensal ?? 0);
  const impacto = impactoObjetivos(objetivos, capacidade, cliente.patrimonio_investido ?? 0, inflacaoProjetadaPct);
  const aporte = Math.max(0, impacto.capacidadeRestante);
  const podeSimular = cliente.idade != null && cliente.idade_aposentadoria != null && cliente.expectativa_vida != null;
  const simulacao = podeSimular
    ? simularEvolucaoPatrimonio(
        cliente.idade!,
        cliente.idade_aposentadoria!,
        cliente.patrimonio_investido ?? 0,
        aporte,
        cliente.pretensao_salarial_aposentadoria ?? cliente.renda_mensal ?? 0,
        rentabilidadeRealPadraoPct,
      )
    : null;
  const recomendacao = podeSimular
    ? compararCenariosAposentadoria({
        idadeAtual: cliente.idade!,
        idadeAposentadoria: cliente.idade_aposentadoria!,
        patrimonioInicial: cliente.patrimonio_investido ?? 0,
        aporteMensalAtual: 0,
        aporteMensalRecomendado: aporte,
        saqueMensalAposentadoria: cliente.pretensao_salarial_aposentadoria ?? cliente.renda_mensal ?? 0,
        taxaAnualPct: rentabilidadeRealPadraoPct,
      })
    : null;
  const saudePlano = scoreSaudePlano({
    reservaAtual: cliente.patrimonio_investido ?? 0,
    reservaIdeal: reservaEmergenciaIdeal(cliente.despesa_mensal ?? 0),
    capacidadeMensal: capacidade,
    rendaMensal: cliente.renda_mensal ?? 0,
    idadeEsgotamento: simulacao?.idadeEsgotamento ?? null,
    expectativaVida: cliente.expectativa_vida ?? 100,
  });

  return (
    <main className="bg-canvas -m-6 min-h-[calc(100vh-65px)] p-6 print:m-0 print:bg-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue">Apresentação do plano</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-navy">{cliente.nome}</h1>
            <p className="mt-1 text-ink-60">Diagnóstico executivo para conversa assessor-cliente</p>
          </div>
          <Link href={`/carteira/${cliente.id}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy print:hidden">
            Voltar ao dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <Card tone="navy">
            <CardLabel>Valor visual para o cliente</CardLabel>
            <div className="font-display text-3xl font-semibold text-white">
              {recomendacao ? formatarMoeda(recomendacao.valorCriado) : "—"}
            </div>
            <p className="mt-2 text-sm text-ink-40">Diferença estimada entre não aportar e seguir o plano.</p>
          </Card>
          <Card>
            <CardLabel>Capacidade livre</CardLabel>
            <div className="font-display text-3xl font-semibold text-navy">{formatarMoeda(aporte)}</div>
            <p className="mt-2 text-sm text-ink-60">Depois de reservar objetivos.</p>
          </Card>
          <Card>
            <CardLabel>Objetivos mapeados</CardLabel>
            <div className="font-display text-3xl font-semibold text-navy">{objetivos.length}</div>
            <p className="mt-2 text-sm text-ink-60">Total futuro: {formatarMoeda(impacto.totalObjetivos)}</p>
          </Card>
          <Card>
            <CardLabel>Saúde do plano</CardLabel>
            <div className="font-display text-3xl font-semibold text-navy">{saudePlano.score}/100</div>
            <p className="mt-2 text-sm font-semibold text-blue">{saudePlano.status}</p>
          </Card>
        </div>

        <Card>
          <CardLabel>Diagnóstico executivo</CardLabel>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <Resumo label="Renda mensal" valor={formatarMoeda(cliente.renda_mensal ?? 0)} />
            <Resumo label="Despesa mensal" valor={formatarMoeda(cliente.despesa_mensal ?? 0)} />
            <Resumo label="Patrimônio investido" valor={formatarMoeda(cliente.patrimonio_investido ?? 0)} />
          </div>
        </Card>

        {simulacao && (
          <Card>
            <CardLabel>Curva do futuro financeiro</CardLabel>
            <PatrimonioEvolucaoChart
              pontos={simulacao.pontos}
              idadeAposentadoria={simulacao.idadeAposentadoria}
              idadeEsgotamento={simulacao.idadeEsgotamento}
              objetivos={objetivos}
            />
          </Card>
        )}

        <Card>
          <CardLabel>Objetivos e próximos passos</CardLabel>
          {objetivos.length === 0 ? (
            <p className="text-sm text-ink-60">Formalizar objetivos de curto, médio e longo prazo.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {objetivos.map((objetivo) => (
                <li key={objetivo.id} className="rounded-xl border border-line p-4 text-sm">
                  <b className="text-navy">{objetivo.descricao}</b>
                  <p className="mt-1 text-ink-60">
                    {formatarMoeda(objetivo.valor_estimado ?? 0)} em {objetivo.horizonte_anos ?? 0} ano(s)
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </main>
  );
}

function Resumo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <span className="text-ink-60">{label}</span>
      <b className="mt-1 block font-display text-xl text-navy">{valor}</b>
    </div>
  );
}
