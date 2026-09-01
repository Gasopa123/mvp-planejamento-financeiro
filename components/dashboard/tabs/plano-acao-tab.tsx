import { IconCheck } from "@/components/design-system/icons";
import {
  capacidadeInvestimento,
  computeAccumulation,
  computeDrawdown,
  reservaEmergenciaIdeal,
  taxaPoupanca,
} from "@/lib/calculos";
import { resolverAssumptions } from "@/lib/assumptions";
import { formatarMoeda } from "@/lib/format";
import type {
  Assumptions,
  Cliente,
  Objetivo,
  PessoaVinculada,
} from "@/lib/types/cliente";

type PlanoAcaoTabProps = {
  cliente: Cliente;
  conjuge: PessoaVinculada | null;
  filhos: PessoaVinculada[];
  objetivos: Objetivo[];
  assumptions: Assumptions | null;
};

type ItemPlano = {
  texto: string;
  concluido: boolean;
};

function montarItens({
  cliente,
  conjuge,
  filhos,
  objetivos,
  assumptions,
}: PlanoAcaoTabProps): ItemPlano[] {
  const itens: ItemPlano[] = [];

  if (cliente.despesa_mensal != null) {
    const reservaIdeal = reservaEmergenciaIdeal(cliente.despesa_mensal);
    itens.push({
      texto: `Montar reserva de emergência de ${formatarMoeda(reservaIdeal)} (4x a despesa mensal)`,
      concluido: (cliente.patrimonio_investido ?? 0) >= reservaIdeal,
    });
  }

  const temDependente = Boolean(conjuge?.dependente) || filhos.some((f) => f.dependente);
  itens.push({
    texto: temDependente
      ? "Ter seguro de vida ativo para proteger os dependentes"
      : "Ter seguro de vida ativo",
    concluido: cliente.tem_seguro_vida,
  });

  if (cliente.renda_mensal != null && cliente.despesa_mensal != null) {
    const taxa = cliente.renda_mensal > 0
      ? taxaPoupanca(cliente.renda_mensal, cliente.despesa_mensal)
      : 0;
    itens.push({
      texto: `Manter taxa de poupança de ao menos 20% da renda (atual: ${Math.round(
        Math.max(0, taxa) * 100,
      )}%)`,
      concluido: taxa >= 0.2,
    });
  }

  itens.push({
    texto: "Ter objetivos de curto, médio e longo prazo formalizados no planejamento",
    concluido: objetivos.length > 0,
  });

  if (
    cliente.idade != null &&
    cliente.idade_aposentadoria != null &&
    cliente.expectativa_vida != null
  ) {
    const { rentabilidadeRealPadraoPct } = resolverAssumptions(assumptions);
    const tempoRestante = Math.max(0, cliente.idade_aposentadoria - cliente.idade);
    const aporte = Math.max(0, capacidadeInvestimento(cliente.renda_mensal ?? 0, cliente.despesa_mensal ?? 0));
    const patrimonioEstimado =
      tempoRestante > 0
        ? computeAccumulation(
            aporte,
            tempoRestante,
            cliente.patrimonio_investido ?? 0,
            rentabilidadeRealPadraoPct,
          )
        : (cliente.patrimonio_investido ?? 0);
    const { idadeEsgotamento } = computeDrawdown(
      rentabilidadeRealPadraoPct,
      cliente.pretensao_salarial_aposentadoria ?? 0,
      patrimonioEstimado,
      cliente.idade_aposentadoria,
      cliente.expectativa_vida,
    );
    itens.push({
      texto: `Ter patrimônio suficiente para sustentar a aposentadoria até os ${cliente.expectativa_vida} anos`,
      concluido: idadeEsgotamento == null || idadeEsgotamento >= cliente.expectativa_vida,
    });
  }

  if (cliente.tem_participacao_societaria) {
    itens.push({
      texto: "Formalizar plano sucessório para a participação societária",
      concluido: false,
    });
  }

  return itens;
}

export function PlanoAcaoTab(props: PlanoAcaoTabProps) {
  const itens = montarItens(props);

  return (
    <div className="flex flex-col gap-3.5">
      {itens.map((item) => (
        <div
          key={item.texto}
          className="flex items-center gap-4 rounded-2xl border border-line bg-white p-[18px] shadow-brand-sm"
        >
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
              item.concluido
                ? "border-green bg-green text-white"
                : "border-ink-40 bg-white text-transparent"
            }`}
          >
            <IconCheck className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-medium text-navy">{item.texto}</span>
        </div>
      ))}
    </div>
  );
}
