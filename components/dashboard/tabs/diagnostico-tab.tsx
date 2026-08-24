import { atualizarCliente } from "@/app/carteira/[clientId]/actions";
import { Card, CardLabel, StatCard } from "@/components/design-system/card";
import { GaugeChart } from "@/components/design-system/charts/gauge-chart";
import { DonutChart } from "@/components/design-system/charts/donut-chart";
import { ProgressTrack } from "@/components/design-system/progress-track";
import { capacidadeInvestimento, taxaPoupanca } from "@/lib/calculos";
import { formatarMoeda, formatarPercentual } from "@/lib/format";
import type { Cliente } from "@/lib/types/cliente";

type DiagnosticoTabProps = {
  cliente: Cliente;
};

export function DiagnosticoTab({ cliente }: DiagnosticoTabProps) {
  const renda = cliente.renda_mensal;
  const despesa = cliente.despesa_mensal;

  if (renda == null || despesa == null) {
    return (
      <Card>
        <p className="text-sm text-ink-60">
          Renda e/ou despesa mensal não informadas para este cliente — cadastre
          esses dados pra ver o diagnóstico financeiro.
        </p>
      </Card>
    );
  }

  const capacidade = capacidadeInvestimento(renda, despesa);
  const taxa = renda > 0 ? taxaPoupanca(renda, despesa) : 0;
  const percentualPoupanca = Math.max(0, taxa * 100);
  const percentualDespesa = renda > 0 ? (despesa / renda) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Renda mensal" value={formatarMoeda(renda)} accent="navy" />
        <StatCard label="Despesa mensal" value={formatarMoeda(despesa)} accent="muted" />
        <StatCard
          label="Capacidade de investimento"
          value={formatarMoeda(capacidade)}
          accent={capacidade >= 0 ? "green" : "gold"}
        />
      </div>

      <Card>
        <details>
          <summary className="cursor-pointer rounded-full border border-line px-3 py-1.5 text-center text-sm font-semibold text-navy hover:bg-blue-soft">
            Editar renda e despesas
          </summary>
          <form action={atualizarCliente} className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <input type="hidden" name="clientId" value={cliente.id} />
            <label className="space-y-1">
              <span className="font-medium text-ink-60">Renda mensal</span>
              <input name="renda_mensal" defaultValue={renda} className="w-full rounded-xl border border-line px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="font-medium text-ink-60">Despesa mensal</span>
              <input name="despesa_mensal" defaultValue={despesa} className="w-full rounded-xl border border-line px-3 py-2" />
            </label>
            <button type="submit" className="self-end rounded-full bg-navy px-4 py-2 font-semibold text-white">
              Salvar
            </button>
          </form>
        </details>
      </Card>

      <Card className="flex flex-col items-center gap-8 sm:flex-row">
        <GaugeChart percent={percentualPoupanca} />
        <div className="flex-1">
          <CardLabel>Taxa de poupança</CardLabel>
          <div className="mb-3 font-display text-2xl font-semibold text-navy">
            {formatarPercentual(percentualPoupanca, 0)} da renda é investida
            todos os meses
          </div>
          <ProgressTrack percent={percentualPoupanca} />
        </div>
      </Card>

      <Card className="grid grid-cols-1 items-center gap-10 sm:grid-cols-[240px_1fr]">
        <div className="flex justify-center">
          <DonutChart
            segments={[
              { label: "Despesas", value: Math.max(0, despesa), color: "#93A0B4" },
              {
                label: "Capacidade de investimento",
                value: Math.max(0, capacidade),
                color: "#2ECC71",
              },
            ]}
          />
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3.5">
            <span className="inline-block h-3.5 w-3.5 rounded-[4px] bg-[#93A0B4]" />
            <div className="flex-1">
              <b className="font-display text-base">Despesas</b>
              <div className="text-[13px] text-ink-60">
                {formatarMoeda(despesa)} · {formatarPercentual(percentualDespesa, 0)} da receita
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="inline-block h-3.5 w-3.5 rounded-[4px] bg-green" />
            <div className="flex-1">
              <b className="font-display text-base">Capacidade de investimento</b>
              <div className="text-[13px] text-ink-60">
                {formatarMoeda(capacidade)} · {formatarPercentual(100 - percentualDespesa, 0)} da receita
              </div>
            </div>
          </div>
          <div className="mt-1.5 flex justify-between border-t border-line pt-4">
            <span className="text-sm text-ink-60">Saldo mensal disponível</span>
            <b className="font-display text-lg text-blue">{formatarMoeda(capacidade)}</b>
          </div>
        </div>
      </Card>
    </div>
  );
}
