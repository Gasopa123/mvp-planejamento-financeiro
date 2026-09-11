import { Card, CardLabel } from "@/components/design-system/card";
import { formatarMoeda } from "@/lib/format";
import type { BasesDaSimulacao, CenarioSimulado } from "@/lib/simulacao";

type ResultadosDoCenarioProps = {
  impactoDosObjetivos: BasesDaSimulacao["impactoDosObjetivos"];
  valorDaRecomendacao: CenarioSimulado["valorDaRecomendacao"];
  patrimonioNaAposentadoria: number;
};

// Os três cartões de números do cenário simulado, entre os controles e o
// veredito. Só leem o que a simulação já calculou — nenhuma conta aqui.
export function ResultadosDoCenario({
  impactoDosObjetivos,
  valorDaRecomendacao,
  patrimonioNaAposentadoria,
}: ResultadosDoCenarioProps) {
  return (
    <>
      <Card>
        <CardLabel>Objetivos — leitura alternativa (poupar mês a mês)</CardLabel>
        <p className="mb-3 text-xs text-ink-40">
          Na curva acima os objetivos saem do patrimônio de uma vez, no ano em
          que vencem. Os números abaixo mostram o outro caminho: reservar um
          valor todo mês até lá. São formas alternativas de pagar o mesmo
          objetivo — não se somam.
        </p>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <span className="text-ink-60">Aporte reservado a objetivos</span>
            <b className="block text-navy">{formatarMoeda(impactoDosObjetivos.aporteMensalObjetivos)}</b>
          </div>
          <div>
            <span className="text-ink-60">Livre para aposentadoria</span>
            <b className={impactoDosObjetivos.capacidadeRestante >= 0 ? "block text-green-ink" : "block text-gold-ink"}>
              {formatarMoeda(impactoDosObjetivos.capacidadeRestante)}
            </b>
          </div>
          <div>
            <span className="text-ink-60">Patrimônio após objetivos</span>
            <b className={impactoDosObjetivos.patrimonioDepoisObjetivos >= 0 ? "block text-navy" : "block text-gold-ink"}>
              {formatarMoeda(impactoDosObjetivos.patrimonioDepoisObjetivos)}
            </b>
          </div>
        </div>
      </Card>

      <Card>
        <CardLabel>Valor da recomendação</CardLabel>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <span className="text-ink-60">Cenário atual</span>
            <b className="block text-ink">{formatarMoeda(valorDaRecomendacao.atual)}</b>
          </div>
          <div>
            <span className="text-ink-60">Cenário recomendado</span>
            <b className="block text-navy">{formatarMoeda(valorDaRecomendacao.recomendado)}</b>
          </div>
          <div>
            <span className="text-ink-60">Valor criado até a aposentadoria</span>
            <b className={valorDaRecomendacao.valorCriado >= 0 ? "block text-green-ink" : "block text-gold-ink"}>
              {formatarMoeda(valorDaRecomendacao.valorCriado)}
            </b>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-40">
          Compara manter só o patrimônio atual investido contra investir o aporte recomendado nesta simulação.
        </p>
      </Card>

      <Card>
        <CardLabel>Patrimônio estimado ao se aposentar</CardLabel>
        <div className="font-display text-3xl font-semibold text-navy">
          {formatarMoeda(patrimonioNaAposentadoria)}
        </div>
      </Card>
    </>
  );
}
