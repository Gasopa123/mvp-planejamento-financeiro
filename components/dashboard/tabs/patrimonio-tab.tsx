import { Card, CardLabel } from "@/components/design-system/card";
import { IconChip } from "@/components/design-system/icon-chip";
import {
  IconBriefcase,
  IconHome,
  IconInvestimentos,
  IconVeiculo,
} from "@/components/design-system/icons";
import { ProgressTrack } from "@/components/design-system/progress-track";
import { Badge } from "@/components/design-system/badge";
import { reservaEmergenciaIdeal } from "@/lib/calculos";
import { formatarMoeda } from "@/lib/format";
import type { Cliente, Propriedade } from "@/lib/types/cliente";

type PatrimonioTabProps = {
  cliente: Cliente;
  imoveis: Propriedade[];
  automoveis: Propriedade[];
};

function somaValor(propriedades: Propriedade[]): number {
  return propriedades.reduce((total, p) => total + (p.valor ?? 0), 0);
}

export function PatrimonioTab({ cliente, imoveis, automoveis }: PatrimonioTabProps) {
  const patrimonioInvestido = cliente.patrimonio_investido ?? 0;
  const somaImoveis = somaValor(imoveis);
  const somaAutomoveis = somaValor(automoveis);
  const participacao =
    cliente.tem_participacao_societaria ? (cliente.valor_participacao ?? 0) : 0;
  const patrimonioTotal =
    patrimonioInvestido + somaImoveis + somaAutomoveis + participacao;

  const reservaIdeal = reservaEmergenciaIdeal(cliente.despesa_mensal ?? 0);
  const reservaAtual = patrimonioInvestido;
  const progressoReserva = reservaIdeal > 0 ? (reservaAtual / reservaIdeal) * 100 : 0;
  const reservaAtingida = reservaAtual >= reservaIdeal && reservaIdeal > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <IconChip tone="blue">
            <IconInvestimentos />
          </IconChip>
          <CardLabel>Investimentos</CardLabel>
          <div className="font-display text-2xl font-semibold text-navy">
            {formatarMoeda(patrimonioInvestido)}
          </div>
        </Card>

        <Card>
          <IconChip tone="gold">
            <IconHome />
          </IconChip>
          <CardLabel>Imóveis ({imoveis.length})</CardLabel>
          <div className="font-display text-2xl font-semibold text-navy">
            {formatarMoeda(somaImoveis)}
          </div>
        </Card>

        <Card>
          <IconChip tone="gold">
            <IconVeiculo />
          </IconChip>
          <CardLabel>Automóveis ({automoveis.length})</CardLabel>
          <div className="font-display text-2xl font-semibold text-navy">
            {formatarMoeda(somaAutomoveis)}
          </div>
        </Card>

        {cliente.tem_participacao_societaria && (
          <Card>
            <IconChip tone="blue">
              <IconBriefcase />
            </IconChip>
            <CardLabel>Participação societária</CardLabel>
            <div className="font-display text-2xl font-semibold text-navy">
              {formatarMoeda(participacao)}
            </div>
          </Card>
        )}

        <Card tone="navy">
          <IconChip tone="green">
            <IconInvestimentos />
          </IconChip>
          <div className="mb-2.5 text-[11.5px] font-bold tracking-[0.1em] text-ink-40 uppercase">
            Patrimônio total
          </div>
          <div className="font-display text-[26px] font-semibold text-white">
            {formatarMoeda(patrimonioTotal)}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardLabel>Reserva de emergência</CardLabel>
          <Badge tone={reservaAtingida ? "green" : "gold"}>
            {reservaAtingida ? "Meta atingida" : "Abaixo do ideal"}
          </Badge>
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <span className="text-ink-60">Ideal (6x a despesa mensal)</span>
          <b className="text-navy">{formatarMoeda(reservaIdeal)}</b>
        </div>
        <div className="mt-1.5 flex justify-between text-sm">
          <span className="text-ink-60">Atual (patrimônio investido)</span>
          <b className="text-navy">{formatarMoeda(reservaAtual)}</b>
        </div>
        <ProgressTrack percent={progressoReserva} className="mt-4" />
      </Card>
    </div>
  );
}
