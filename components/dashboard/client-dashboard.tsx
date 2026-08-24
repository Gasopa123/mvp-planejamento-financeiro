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

const TABS = [
  { id: "perfil", label: "Perfil" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "patrimonio", label: "Patrimônio" },
  { id: "aposentadoria", label: "Aposentadoria" },
  { id: "objetivos", label: "Objetivos" },
  { id: "simulacoes", label: "Simulações" },
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
        <Link
          href="/carteira"
          className="text-sm font-medium text-ink-60 hover:text-navy"
        >
          ← Voltar pra carteira
        </Link>

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
          <DashboardSection id="perfil" title="Perfil">
            <PerfilTab cliente={cliente} conjuge={conjuge} filhos={filhos} />
          </DashboardSection>
          <DashboardSection id="diagnostico" title="Diagnóstico">
            <DiagnosticoTab cliente={cliente} />
          </DashboardSection>
          <DashboardSection id="patrimonio" title="Patrimônio">
            <PatrimonioTab
              cliente={cliente}
              imoveis={imoveis}
              automoveis={automoveis}
            />
          </DashboardSection>
          <DashboardSection id="aposentadoria" title="Aposentadoria">
            <AposentadoriaTab cliente={cliente} assumptions={assumptions} />
          </DashboardSection>
          <DashboardSection id="objetivos" title="Objetivos">
            <ObjetivosTab objetivos={objetivos} assumptions={assumptions} />
          </DashboardSection>
          <DashboardSection id="simulacoes" title="Simulações">
            <SimulacoesTab cliente={cliente} objetivos={objetivos} assumptions={assumptions} />
          </DashboardSection>
          <DashboardSection id="plano-acao" title="Plano de ação">
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
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 font-display text-2xl font-semibold text-navy">
        {title}
      </h2>
      {children}
    </section>
  );
}
