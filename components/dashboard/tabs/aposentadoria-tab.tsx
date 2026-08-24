import { atualizarCliente } from "@/app/carteira/[clientId]/actions";
import { Card, CardLabel, StatCard } from "@/components/design-system/card";
import { VerdictCard } from "@/components/design-system/verdict-card";
import { DrawdownChart } from "@/components/design-system/charts/drawdown-chart";
import { computeAccumulation, computeDrawdown } from "@/lib/calculos";
import { resolverAssumptions } from "@/lib/assumptions";
import { formatarMoeda } from "@/lib/format";
import type { Assumptions, Cliente } from "@/lib/types/cliente";

type AposentadoriaTabProps = {
  cliente: Cliente;
  assumptions: Assumptions | null;
};

export function AposentadoriaTab({ cliente, assumptions }: AposentadoriaTabProps) {
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
      <Card>
        <p className="text-sm text-ink-60">
          Idade, idade de aposentadoria e/ou expectativa de vida não
          informadas — cadastre esses dados pra ver a projeção de
          aposentadoria.
        </p>
      </Card>
    );
  }

  const { rentabilidadeRealPadraoPct } = resolverAssumptions(assumptions);
  const tempoRestanteAnos = Math.max(0, idadeAposentadoria - idade);
  const aporteMensal = Math.max(0, (renda ?? 0) - (despesa ?? 0));

  const patrimonioEstimado =
    tempoRestanteAnos > 0
      ? computeAccumulation(
          aporteMensal,
          tempoRestanteAnos,
          patrimonioAtual ?? 0,
          rentabilidadeRealPadraoPct,
        )
      : (patrimonioAtual ?? 0);

  const { pontos, idadeEsgotamento } = computeDrawdown(
    rentabilidadeRealPadraoPct,
    pretensaoSalarial ?? 0,
    patrimonioEstimado,
    idadeAposentadoria,
    expectativaVida,
  );

  const sustentavel = idadeEsgotamento == null || idadeEsgotamento >= expectativaVida;

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

      <Card>
        <details>
          <summary className="cursor-pointer rounded-full border border-line px-3 py-1.5 text-center text-sm font-semibold text-navy hover:bg-blue-soft">
            Editar aposentadoria
          </summary>
          <form action={atualizarCliente} className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <input type="hidden" name="clientId" value={cliente.id} />
            <label className="space-y-1">
              <span className="font-medium text-ink-60">Idade-alvo</span>
              <input name="idade_aposentadoria" defaultValue={idadeAposentadoria} className="w-full rounded-xl border border-line px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="font-medium text-ink-60">Expectativa de vida</span>
              <input name="expectativa_vida" defaultValue={expectativaVida} className="w-full rounded-xl border border-line px-3 py-2" />
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
          idadeEsgotamento == null
            ? `Patrimônio sustenta além dos ${pontos[pontos.length - 1]?.idade ?? expectativaVida} anos`
            : sustentavel
              ? `Patrimônio dura até os ${idadeEsgotamento} anos`
              : `Patrimônio se esgota aos ${idadeEsgotamento} anos`
        }
        subtitulo={
          idadeEsgotamento == null
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
      </Card>
    </div>
  );
}
