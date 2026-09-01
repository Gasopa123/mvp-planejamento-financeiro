import Link from "next/link";
import { Card, CardLabel } from "@/components/design-system/card";
import { PatrimonioEvolucaoChart } from "@/components/design-system/charts/patrimonio-evolucao-chart";
import { resolverAssumptions } from "@/lib/assumptions";
import {
  aplicarObjetivosNaCurva,
  capacidadeInvestimento,
  compararCenariosAposentadoria,
  impactoObjetivos,
  simularEvolucaoPatrimonio,
  simularStressTestAposentadoria,
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
  // Capacidade cheia, não a restante depois dos objetivos: na curva os
  // objetivos já saem como retirada pontual no ano em que vencem (ver
  // aplicarObjetivosNaCurva). Descontá-los também do aporte mensal contaria
  // o mesmo objetivo duas vezes. O impacto mensal continua no card abaixo,
  // como leitura alternativa ("se preferir poupar mês a mês").
  const aporte = Math.max(0, capacidade);
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
  const simulacaoSemObjetivos = podeSimular
    ? simularEvolucaoPatrimonio(
        cliente.idade!,
        cliente.idade_aposentadoria!,
        cliente.patrimonio_investido ?? 0,
        capacidade,
        cliente.pretensao_salarial_aposentadoria ?? cliente.renda_mensal ?? 0,
        rentabilidadeRealPadraoPct,
      )
    : null;
  // Mesma regra da aba Simulações: os objetivos com valor e prazo saem do
  // patrimônio no ano em que vencem, e a curva segue do saldo já reduzido.
  const curvaComObjetivos = simulacao
    ? aplicarObjetivosNaCurva(simulacao.pontos, objetivos, rentabilidadeRealPadraoPct)
    : null;
  const stressTests = podeSimular
    ? simularStressTestAposentadoria({
        idadeAtual: cliente.idade!,
        idadeAposentadoria: cliente.idade_aposentadoria!,
        expectativaVida: cliente.expectativa_vida!,
        patrimonioInicial: cliente.patrimonio_investido ?? 0,
        aporteMensal: aporte,
        saqueMensalAposentadoria: cliente.pretensao_salarial_aposentadoria ?? cliente.renda_mensal ?? 0,
        taxaAnualPct: rentabilidadeRealPadraoPct,
      })
    : [];

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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Card tone="navy">
            <CardLabel>Valor visual para o cliente</CardLabel>
            <div className="font-display text-3xl font-semibold text-white">
              {recomendacao ? formatarMoeda(recomendacao.valorCriado) : "—"}
            </div>
            <p className="mt-2 text-sm text-ink-40">Diferença estimada entre não aportar e seguir o plano.</p>
          </Card>
          <Card>
            <CardLabel>Capacidade de investimento</CardLabel>
            <div className="font-display text-3xl font-semibold text-navy">{formatarMoeda(aporte)}</div>
            <p className="mt-2 text-sm text-ink-60">
              Renda menos despesa. É o aporte usado na curva — os objetivos
              entram lá como retirada no ano em que vencem.
            </p>
          </Card>
          <Card>
            <CardLabel>Objetivos mapeados</CardLabel>
            <div className="font-display text-3xl font-semibold text-navy">{objetivos.length}</div>
            <p className="mt-2 text-sm text-ink-60">Total futuro: {formatarMoeda(impacto.totalObjetivos)}</p>
          </Card>
        </div>

        <Card>
          <CardLabel>Objetivos — leitura alternativa (poupar mês a mês)</CardLabel>
          <p className="mb-3 text-xs text-ink-40">
            Na curva os objetivos saem do patrimônio de uma vez, no ano em que
            vencem. Abaixo, o outro caminho: reservar um valor todo mês até lá.
            São formas alternativas de pagar o mesmo objetivo — não se somam.
          </p>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <Resumo label="Aporte reservado" valor={formatarMoeda(impacto.aporteMensalObjetivos)} />
            <Resumo label="Livre para aposentadoria" valor={formatarMoeda(impacto.capacidadeRestante)} />
            <Resumo label="Patrimônio após objetivos" valor={formatarMoeda(impacto.patrimonioDepoisObjetivos)} />
          </div>
        </Card>

        <Card>
          <CardLabel>Diagnóstico executivo</CardLabel>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <Resumo label="Renda mensal" valor={formatarMoeda(cliente.renda_mensal ?? 0)} />
            <Resumo label="Despesa mensal" valor={formatarMoeda(cliente.despesa_mensal ?? 0)} />
            <Resumo label="Patrimônio investido" valor={formatarMoeda(cliente.patrimonio_investido ?? 0)} />
          </div>
        </Card>

        {simulacao && curvaComObjetivos && (
          <Card>
            <CardLabel>Curva do futuro financeiro</CardLabel>
            <PatrimonioEvolucaoChart
              pontos={curvaComObjetivos.pontos}
              pontosComparacao={simulacaoSemObjetivos?.pontos}
              idadeAposentadoria={simulacao.idadeAposentadoria}
              idadeEsgotamento={
                curvaComObjetivos.idadeEsgotamento ?? simulacao.idadeEsgotamento
              }
              objetivos={objetivos}
            />
            <p className="mt-3 text-sm text-ink-60">
              Cada objetivo com valor e prazo sai do patrimônio no ano em que
              vence — é projeção com as premissas informadas, não promessa.
            </p>
          </Card>
        )}

        {stressTests.length > 0 && (
          <Card>
            <CardLabel>Stress test</CardLabel>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-5">
              {stressTests.map((cenario) => (
                <div key={cenario.nome} className="rounded-xl border border-line p-3">
                  <span className="block text-xs font-semibold text-ink-60">{cenario.nome}</span>
                  <b className="mt-1 block text-navy">{formatarMoeda(cenario.patrimonioNaAposentadoria)}</b>
                  <span className="mt-1 block text-xs text-ink-40">
                    {cenario.idadeEsgotamento == null ? `sustenta até ${cenario.idadeReferencia}` : `esgota aos ${cenario.idadeEsgotamento}`}
                  </span>
                </div>
              ))}
            </div>
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
