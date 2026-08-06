"use client";

import { useState } from "react";
import Link from "next/link";
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
  { id: "objetivos", label: "Objetivos" },
  { id: "aposentadoria", label: "Aposentadoria" },
  { id: "simulacoes", label: "Simulações" },
  { id: "plano-acao", label: "Plano de ação" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ClientDashboard({
  cliente,
  conjuge,
  filhos,
  imoveis,
  automoveis,
  objetivos,
  assumptions,
}: ClientDashboardProps) {
  const [tab, setTab] = useState<TabId>("perfil");

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

        <nav className="mt-6 flex flex-wrap gap-2 border-b border-line pb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "bg-navy text-white"
                  : "bg-white text-ink-60 hover:bg-blue-soft hover:text-blue"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          {tab === "perfil" && (
            <PerfilTab cliente={cliente} conjuge={conjuge} filhos={filhos} />
          )}
          {tab === "diagnostico" && <DiagnosticoTab cliente={cliente} />}
          {tab === "patrimonio" && (
            <PatrimonioTab
              cliente={cliente}
              imoveis={imoveis}
              automoveis={automoveis}
            />
          )}
          {tab === "objetivos" && (
            <ObjetivosTab objetivos={objetivos} assumptions={assumptions} />
          )}
          {tab === "aposentadoria" && (
            <AposentadoriaTab cliente={cliente} assumptions={assumptions} />
          )}
          {tab === "simulacoes" && (
            <SimulacoesTab cliente={cliente} assumptions={assumptions} />
          )}
          {tab === "plano-acao" && (
            <PlanoAcaoTab
              cliente={cliente}
              conjuge={conjuge}
              filhos={filhos}
              objetivos={objetivos}
              assumptions={assumptions}
            />
          )}
        </div>
      </div>
    </div>
  );
}
