"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type {
  Assumptions,
  Cliente,
  Objetivo,
  PessoaVinculada,
  Propriedade,
} from "@/lib/types/cliente";
import { PerfilTab } from "./tabs/perfil-tab";
import { DiagnosticoTab } from "./tabs/diagnostico-tab";
import { PatrimonioTab } from "./tabs/patrimonio-tab";
import { ObjetivosTab } from "./tabs/objetivos-tab";
import { AposentadoriaTab } from "./tabs/aposentadoria-tab";
import { SimulacoesTab } from "./tabs/simulacoes-tab";
import { chaveDosValoresIniciais } from "@/lib/simulacao";
import { PlanoAcaoTab } from "./tabs/plano-acao-tab";

type ClientDashboardProps = {
  cliente: Cliente;
  conjuge: PessoaVinculada | null;
  filhos: PessoaVinculada[];
  imoveis: Propriedade[];
  automoveis: Propriedade[];
  objetivos: Objetivo[];
  assumptions: Assumptions | null;
};

// A ordem aqui é a mesma das seções renderizadas abaixo — a navegação só
// ancora nelas, então as duas listas têm que andar juntas. Aposentadoria e
// objetivos vêm antes de patrimônio: é o que o assessor apresenta primeiro.
const TABS = [
  { id: "perfil", label: "Perfil" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "aposentadoria", label: "Aposentadoria" },
  { id: "objetivos", label: "Objetivos" },
  { id: "simulacoes", label: "Simulações" },
  { id: "patrimonio", label: "Patrimônio" },
  { id: "plano-acao", label: "Plano de ação" },
] as const;

export function ClientDashboard({
  cliente,
  conjuge,
  filhos,
  imoveis,
  automoveis,
  objetivos,
  assumptions,
}: ClientDashboardProps) {
  return (
    <div className="bg-canvas -m-6 min-h-[calc(100vh-65px)] p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/carteira"
            className="text-sm font-medium text-ink-60 hover:text-navy"
          >
            ← Voltar pra carteira
          </Link>
          <Link
            href={`/carteira/${cliente.id}/apresentacao`}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-navy hover:bg-blue-soft"
          >
            Modo apresentação
          </Link>
        </div>

        <h1 className="mt-3 font-display text-3xl font-semibold text-navy">
          {cliente.nome}
        </h1>
        <p className="mt-1 text-sm text-ink-60">
          {cliente.idade != null ? `${cliente.idade} anos` : "Idade não informada"}
        </p>

        <nav className="sticky top-0 z-10 mt-6 flex flex-wrap gap-2 border-b border-line bg-canvas/95 pb-4 pt-2 backdrop-blur">
          {TABS.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-60 transition-colors hover:bg-blue-soft hover:text-blue"
            >
              {t.label}
            </a>
          ))}
        </nav>

        <div className="mt-8 space-y-10">
          <DashboardSection
            id="perfil"
            title="Perfil"
            subtitle="Quem é o cliente e quem depende dele."
          >
            <PerfilTab cliente={cliente} conjuge={conjuge} filhos={filhos} />
          </DashboardSection>
          <DashboardSection
            id="diagnostico"
            title="Diagnóstico"
            subtitle="Quanto entra, quanto sai e quanto sobra para investir todo mês."
          >
            <DiagnosticoTab cliente={cliente} />
          </DashboardSection>
          <DashboardSection
            id="aposentadoria"
            title="Aposentadoria"
            subtitle="Quanto o patrimônio acumula e por quanto tempo ele sustenta a renda desejada."
          >
            <AposentadoriaTab
              cliente={cliente}
              objetivos={objetivos}
              assumptions={assumptions}
            />
          </DashboardSection>
          <DashboardSection
            id="objetivos"
            title="Objetivos"
            subtitle="O que ainda é meta."
          >
            <ObjetivosTab objetivos={objetivos} assumptions={assumptions} cliente={cliente} />
          </DashboardSection>
          <DashboardSection
            id="simulacoes"
            title="Simulações"
            subtitle="Mexa nos três controles e veja a curva e o veredito mudarem na hora, na frente do cliente."
          >
            <SimulacoesTab
              key={chaveDosValoresIniciais(cliente, assumptions)}
              cliente={cliente}
              objetivos={objetivos}
              assumptions={assumptions}
            />
          </DashboardSection>
          <DashboardSection
            id="patrimonio"
            title="Patrimônio"
            subtitle="O que já existe."
          >
            <PatrimonioTab
              cliente={cliente}
              imoveis={imoveis}
              automoveis={automoveis}
            />
          </DashboardSection>
          <DashboardSection
            id="plano-acao"
            title="Plano de ação"
            subtitle="O que fazer em seguida."
          >
            <PlanoAcaoTab
              cliente={cliente}
              conjuge={conjuge}
              filhos={filhos}
              objetivos={objetivos}
              assumptions={assumptions}
            />
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}


function DashboardSection({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  /** Uma linha dizendo o que a seção responde, como no canvas aprovado. */
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    // A barra de âncoras é sticky e muda de altura conforme as pílulas
    // quebram: 193px até 375px, 105px até 1023px e 61px daí pra cima. A
    // margem de rolagem acompanha, senão a âncora esconde o título atrás dela.
    <section
      id={id}
      className="scroll-mt-[200px] sm:scroll-mt-28 lg:scroll-mt-24"
    >
      <div className="mb-4">
        <h2 className="font-display text-2xl font-semibold text-navy">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-60">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
