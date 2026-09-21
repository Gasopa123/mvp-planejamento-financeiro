import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ClientCard } from "@/components/client-card";
import { IconChip } from "@/components/design-system/icon-chip";
import { IconUsers } from "@/components/design-system/icons";

const botaoPrimario =
  "inline-flex h-11 items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

export default async function CarteiraPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, nome, idade, patrimonio_investido")
    .eq("advisor_id", user?.id ?? "")
    .order("nome", { ascending: true });

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Carteira de clientes
          </h1>
          {!error && clients && clients.length > 0 && (
            <p className="mt-1 text-sm text-ink-60">
              {clients.length === 1 ? "1 cliente" : `${clients.length} clientes`}
            </p>
          )}
        </div>
        <Link href="/carteira/novo" className={botaoPrimario}>
          Adicionar cliente
        </Link>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          Não foi possível carregar seus clientes. Tente novamente em
          instantes.
        </p>
      )}

      {!error && clients && clients.length === 0 && (
        <div className="mt-8 flex flex-col items-center rounded-card border border-dashed border-line bg-white p-10 text-center">
          <IconChip tone="blue">
            <IconUsers />
          </IconChip>
          <p className="font-display text-xl font-semibold text-navy">
            Você ainda não tem clientes cadastrados
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink-60">
            Cadastre o primeiro cliente pra começar a montar o planejamento
            financeiro.
          </p>
          <Link href="/carteira/novo" className={`mt-6 ${botaoPrimario}`}>
            Cadastrar primeiro cliente
          </Link>
        </div>
      )}

      {!error && clients && clients.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              id={client.id}
              nome={client.nome}
              idade={client.idade}
              patrimonioInvestido={client.patrimonio_investido}
            />
          ))}
        </div>
      )}
    </div>
  );
}
