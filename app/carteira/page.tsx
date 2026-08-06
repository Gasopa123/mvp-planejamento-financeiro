import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ClientCard } from "@/components/client-card";

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
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Carteira de clientes
        </h1>
        <Link
          href="/carteira/novo"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Adicionar cliente
        </Link>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-600">
          Não foi possível carregar seus clientes. Tente novamente em
          instantes.
        </p>
      )}

      {!error && clients && clients.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-base font-medium text-gray-900">
            Você ainda não tem clientes cadastrados
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Cadastre o primeiro cliente pra começar a montar o planejamento
            financeiro.
          </p>
          <Link
            href="/carteira/novo"
            className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Cadastrar primeiro cliente
          </Link>
        </div>
      )}

      {!error && clients && clients.length > 0 && (
        <div className="mt-6 space-y-3">
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
