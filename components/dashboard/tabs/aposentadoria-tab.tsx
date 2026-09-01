import { atualizarCliente } from "@/app/carteira/[clientId]/actions";
import { Card, CardLabel, StatCard } from "@/components/design-system/card";
import { VerdictCard } from "@/components/design-system/verdict-card";
import { DrawdownChart } from "@/components/design-system/charts/drawdown-chart";
import {
  explicarTendenciaPatrimonio,
  projecaoMetaComInflacao,
  projetarPatrimonioComObjetivos,
} from "@/lib/calculos";
import { resolverAssumptions } from "@/lib/assumptions";
import { formatarMoeda } from "@/lib/format";
import type { Assumptions, Cliente, Objetivo } from "@/lib/types/cliente";

type AposentadoriaTabProps = {
  cliente: Cliente;
  objetivos: Objetivo[];
  assumptions: Assumptions | null;
};

// Formulário de correção da aposentadoria. Fica fora do fluxo feliz de
// propósito: quando os dados estão inválidos é exatamente aqui que o advisor
// conserta, então a tela de erro precisa mostrá-lo também (já aberto).
function FormEditarAposentadoria({
  clienteId,
  idadeAposentadoria,
  expectativaVida,
  pretensaoSalarial,
  aberto = false,
}: {
  clienteId: string;
  idadeAposentadoria: number | null;
  expectativaVida: number | null;
  pretensaoSalarial: number | null;
  aberto?: boolean;
}) {
  return (
    <Card>
      <details open={aberto}>
        <summary className="cursor-pointer rounded-full border border-line px-3 py-1.5 text-center text-sm font-semibold text-navy hover:bg-blue-soft">
          Editar aposentadoria
        </summary>
        <form action={atualizarCliente} className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <input type="hidden" name="clientId" value={clienteId} />
          <label className="space-y-1">
            <span className="font-medium text-ink-60">Idade-alvo</span>
            <input name="idade_aposentadoria" defaultValue={idadeAposentadoria ?? ""} className="w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-ink-60">Expectativa de vida</span>
            <input name="expectativa_vida" defaultValue={expectativaVida ?? ""} className="w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-ink-60">Renda desejada</span>
            <input name="pretensao_salarial_aposentadoria" defaultValue={pretensaoSalarial ?? ""} className="w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <button type="submit" className="rounded-full bg-navy px-4 py-2 font-semibold text-white sm:col-start-3 sm:justify-self-end">
            Salvar
          </button>
        </form>
      </details>
    </Card>
  );
}

// Erro de dado + formulário de correção logo abaixo, pra quem abre a aba já
// conseguir arrumar sem caçar onde editar.
function AposentadoriaDadoInvalido({
  mensagem,
  cliente,
}: {
  mensagem: string;
  cliente: Cliente;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm text-ink-60">{mensagem}</p>
      </Card>
      <FormEditarAposentadoria
        clienteId={cliente.id}
        idadeAposentadoria={cliente.idade_aposentadoria}
        expectativaVida={cliente.expectativa_vida}
        pretensaoSalarial={cliente.pretensao_salarial_aposentadoria}
        aberto
      />
    </div>
  );
}

export function AposentadoriaTab({ cliente, objetivos, assumptions }: AposentadoriaTabProps) {
  const {
    idade,
    idade_aposentadoria: idadeAposentadoria,
    expectativa_vida: expectativaVida,
    renda_mensal: renda,
    despesa_mensal: despesa,
    patrimonio_investido: patrimonioAtual,
    pretensao_salarial_aposentadoria: pretensaoSalarial,
  } = cliente;

  if (idade == null || idadeAposentadoria == null || expectativaVida == null) {
    return (
      <AposentadoriaDadoInvalido
        cliente={cliente}
        mensagem="Idade, idade de aposentadoria e/ou expectativa de vida não informadas — cadastre esses dados pra ver a projeção de aposentadoria."
      />
    );
  }

  // Sem tempo de acumulação não há projeção pra mostrar: melhor apontar o
  // dado inconsistente do que exibir patrimônio e veredito sem significado.
  if (idadeAposentadoria <= idade) {
    return (
      <AposentadoriaDadoInvalido
        cliente={cliente}
        mensagem={`A idade de aposentadoria cadastrada (${idadeAposentadoria} anos) é menor ou igual à idade atual (${idade} anos) — corrija esse dado pra ver a projeção de aposentadoria.`}
      />
    );
  }

  // Sem anos de aposentadoria pra simular, o drawdown não roda: o saldo nunca
  // é sacado, idadeEsgotamento volta null e a tela diria que o patrimônio
  // "sustenta" — conclusão falsa vinda de dado inconsistente.
  if (expectativaVida <= idadeAposentadoria) {
    return (
      <AposentadoriaDadoInvalido
        cliente={cliente}
        mensagem={`A expectativa de vida cadastrada (${expectativaVida} anos) é menor ou igual à idade de aposentadoria (${idadeAposentadoria} anos) — informe uma expectativa de vida maior pra ver a projeção de aposentadoria.`}
      />
    );
  }

  const { rentabilidadeRealPadraoPct, inflacaoProjetadaPct } =
    resolverAssumptions(assumptions);
  const tempoRestanteAnos = Math.max(0, idadeAposentadoria - idade);
  const aporteMensal = Math.max(0, (renda ?? 0) - (despesa ?? 0));

  // Mesma projeção de Simulações, Plano de ação e apresentação — com os
  // objetivos descontados da curva. Antes esta aba calculava sem objetivos e
  // contradizia as outras na mesma página.
  const projecao = projetarPatrimonioComObjetivos({
    idadeAtual: idade,
    idadeAposentadoria,
    patrimonioInicial: patrimonioAtual ?? 0,
    aporteMensal,
    saqueMensalAposentadoria: pretensaoSalarial ?? 0,
    taxaAnualPct: rentabilidadeRealPadraoPct,
    objetivos,
    idadeMaxima: expectativaVida,
  });
  const { idadeEsgotamento, idadeDeficitPreAposentadoria } = projecao;
  const patrimonioEstimado = projecao.patrimonioNaAposentadoria;

  // O gráfico desta aba mostra só a fase de aposentadoria; o ponto de virada
  // (início da aposentadoria) entra como primeiro ponto do traçado.
  const pontos = projecao.pontos
    .filter(
      (ponto) =>
        ponto.fase === "drawdown" || ponto.idadeAnos === projecao.idadeAposentadoria,
    )
    .map((ponto) => ({ idade: ponto.idadeAnos, saldo: ponto.saldo }));

  const sustentavel =
    idadeDeficitPreAposentadoria == null &&
    (idadeEsgotamento == null || idadeEsgotamento >= expectativaVida);

  // Relatório de investimento: patrimonioEstimado já é "valor real" (a
  // rentabilidade usada é a real, líquida de inflação — ver
  // resolverAssumptions); o "valor nominal" é quanto isso representa em
  // reais correntes daqui a tempoRestanteAnos, projetando pela inflação.
  const valorReal = patrimonioEstimado;
  const valorNominal = projecaoMetaComInflacao(
    valorReal,
    inflacaoProjetadaPct,
    tempoRestanteAnos,
  );
  const diferencaNominalReal = valorNominal - valorReal;

  // Saldos reais da curva de drawdown — a tendência (subiu/caiu/estável) é
  // lida deles, e não de idadeEsgotamento: não zerar até o fim da simulação
  // não quer dizer que o principal tenha sido preservado.
  const primeiroPontoDrawdown = pontos[0];
  const ultimoPontoDrawdown = pontos[pontos.length - 1];
  const explicacaoTendencia = explicarTendenciaPatrimonio({
    aporteMensal,
    saqueMensalAposentadoria: pretensaoSalarial ?? 0,
    idadeEsgotamento,
    expectativaVida,
    saldoInicioAposentadoria: primeiroPontoDrawdown?.saldo ?? patrimonioEstimado,
    saldoFinalSimulacao: ultimoPontoDrawdown?.saldo ?? patrimonioEstimado,
    idadeFinalSimulacao: ultimoPontoDrawdown?.idade ?? expectativaVida,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Idade atual" value={`${idade} anos`} accent="navy" />
        <StatCard label="Idade-alvo" value={`${idadeAposentadoria} anos`} accent="blue" />
        <StatCard
          label="Tempo restante"
          value={`${tempoRestanteAnos} ${tempoRestanteAnos === 1 ? "ano" : "anos"}`}
          accent="gold"
        />
        <StatCard label="Expectativa de vida" value={`${expectativaVida} anos`} accent="muted" />
      </div>

      <FormEditarAposentadoria
        clienteId={cliente.id}
        idadeAposentadoria={idadeAposentadoria}
        expectativaVida={expectativaVida}
        pretensaoSalarial={pretensaoSalarial}
      />

      <Card>
        <CardLabel>Patrimônio estimado ao se aposentar</CardLabel>
        <div className="font-display text-3xl font-semibold text-navy">
          {formatarMoeda(patrimonioEstimado)}
        </div>
        <p className="mt-2 text-sm text-ink-60">
          Considerando aporte mensal de {formatarMoeda(aporteMensal)} (capacidade
          de investimento atual) por {tempoRestanteAnos} anos, a{" "}
          {rentabilidadeRealPadraoPct.toLocaleString("pt-BR")}% a.a. de
          rentabilidade real.
        </p>
      </Card>

      <VerdictCard
        positivo={sustentavel}
        titulo={
          idadeDeficitPreAposentadoria != null
            ? `Os objetivos comprometem o patrimônio aos ${idadeDeficitPreAposentadoria} anos`
            : idadeEsgotamento == null
              ? `Patrimônio sustenta além dos ${pontos[pontos.length - 1]?.idade ?? expectativaVida} anos`
              : sustentavel
                ? `Patrimônio dura até os ${idadeEsgotamento} anos`
                : `Patrimônio se esgota aos ${idadeEsgotamento} anos`
        }
        subtitulo={
          idadeDeficitPreAposentadoria != null
            ? "Os objetivos comprometem o patrimônio antes da aposentadoria. Revise prazo, valor ou aporte."
            : idadeEsgotamento == null
              ? "Com essas premissas, o saldo nunca se esgota na simulação — ainda sobra patrimônio como herança."
              : sustentavel
                ? `Cobre a expectativa de vida de ${expectativaVida} anos.`
                : `Isso é ${expectativaVida - idadeEsgotamento} ano(s) antes da expectativa de vida de ${expectativaVida} anos — vale ajustar aporte ou rentabilidade na aba Simulações.`
        }
        badgeLabel={sustentavel ? "Objetivo atingido" : "Requer ajuste"}
      />

      <Card>
        <CardLabel>Sustentabilidade do patrimônio na aposentadoria</CardLabel>
        <DrawdownChart pontos={pontos} idadeEsgotamento={idadeEsgotamento} />
        <p className="mt-3 text-sm text-ink-60">{explicacaoTendencia}</p>
      </Card>

      <Card>
        <CardLabel>Relatório de investimento</CardLabel>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <span className="text-ink-60">Valor real (poder de compra de hoje)</span>
            <b className="block text-navy">{formatarMoeda(valorReal)}</b>
          </div>
          <div>
            <span className="text-ink-60">Valor nominal (reais na data)</span>
            <b className="block text-navy">{formatarMoeda(valorNominal)}</b>
          </div>
          <div>
            <span className="text-ink-60">Diferença (efeito da inflação)</span>
            <b className="block text-gold-ink">{formatarMoeda(diferencaNominalReal)}</b>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-40">
          Valor real é quanto {formatarMoeda(patrimonioEstimado)} valem hoje;
          valor nominal é quanto efetivamente estará na conta em{" "}
          {tempoRestanteAnos} anos, já contando a inflação projetada de{" "}
          {inflacaoProjetadaPct.toLocaleString("pt-BR")}% a.a. — a diferença é
          só efeito da inflação, não poder de compra a mais.
        </p>
      </Card>
    </div>
  );
}
