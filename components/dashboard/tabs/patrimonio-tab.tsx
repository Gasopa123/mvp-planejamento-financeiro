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

function labelPropriedade(p: Propriedade): string {
  const subtipo = p.subtipo ? p.subtipo[0].toUpperCase() + p.subtipo.slice(1) : p.tipo;
  return p.modelo ? `${subtipo} — ${p.modelo}` : subtipo;
}

function PropriedadeDetalhe({ propriedade }: { propriedade: Propriedade }) {
  return (
    <li className="rounded-lg border border-line p-3 text-sm">
      <div className="flex justify-between gap-3">
        <span className="font-semibold text-navy">{labelPropriedade(propriedade)}</span>
        <span className="font-display font-semibold text-navy">
          {formatarMoeda(propriedade.valor ?? 0)}
        </span>
      </div>
      {propriedade.financiado && (
        <p className="mt-1 text-xs text-ink-60">
          Financiado
          {propriedade.financiamento_termino
            ? ` até ${propriedade.financiamento_termino}`
            : ""}
          {propriedade.parcela_financiamento != null
            ? ` · Parcela ${formatarMoeda(propriedade.parcela_financiamento)}`
            : ""}
        </p>
      )}
    </li>
  );
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
          {cliente.local_aplicado && (
            <p className="mt-2 text-sm text-ink-60">{cliente.local_aplicado}</p>
          )}
          {cliente.tem_investimento_exterior && (
            <p className="mt-1 text-sm text-ink-60">
              Investimento no exterior: {formatarMoeda(cliente.valor_investimento_exterior ?? 0)}
            </p>
          )}
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
            {cliente.percentual_participacao != null && (
              <p className="mt-2 text-sm text-ink-60">
                {cliente.percentual_participacao.toLocaleString("pt-BR")}% de participação
              </p>
            )}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardLabel>Imóveis detalhados</CardLabel>
          {imoveis.length === 0 ? (
            <p className="text-sm text-ink-60">Nenhum imóvel cadastrado.</p>
          ) : (
            <ul className="space-y-3">
              {imoveis.map((imovel) => (
                <PropriedadeDetalhe key={imovel.id} propriedade={imovel} />
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardLabel>Automóveis detalhados</CardLabel>
          {automoveis.length === 0 ? (
            <p className="text-sm text-ink-60">Nenhum automóvel cadastrado.</p>
          ) : (
            <ul className="space-y-3">
              {automoveis.map((automovel) => (
                <PropriedadeDetalhe key={automovel.id} propriedade={automovel} />
              ))}
            </ul>
          )}
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
