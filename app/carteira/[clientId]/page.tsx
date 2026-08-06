import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import type {
  Assumptions,
  Cliente,
  Objetivo,
  PessoaVinculada,
  Propriedade,
} from "@/lib/types/cliente";

export default async function ClientDashboardPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // Filtro explícito por advisor_id, além da RLS: se o cliente não existir
  // OU pertencer a outro advisor, o select simplesmente não retorna linha —
  // e caímos direto no 404, sem vazar a existência do registro.
  const { data: cliente } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .eq("advisor_id", user.id)
    .maybeSingle<Cliente>();

  if (!cliente) notFound();

  const [
    { data: conjuge },
    { data: filhos },
    { data: propriedades },
    { data: objetivos },
    { data: assumptions },
  ] = await Promise.all([
    supabase
      .from("spouses")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle<PessoaVinculada>(),
    supabase
      .from("children")
      .select("*")
      .eq("client_id", clientId)
      .order("nome")
      .returns<PessoaVinculada[]>(),
    supabase
      .from("properties")
      .select("*")
      .eq("client_id", clientId)
      .returns<Propriedade[]>(),
    supabase
      .from("goals")
      .select("*")
      .eq("client_id", clientId)
      .returns<Objetivo[]>(),
    supabase
      .from("assumptions")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle<Assumptions>(),
  ]);

  const todasPropriedades = propriedades ?? [];

  return (
    <ClientDashboard
      cliente={cliente}
      conjuge={conjuge ?? null}
      filhos={filhos ?? []}
      imoveis={todasPropriedades.filter((p) => p.tipo === "imovel")}
      automoveis={todasPropriedades.filter((p) => p.tipo === "automovel")}
      objetivos={objetivos ?? []}
      assumptions={assumptions ?? null}
    />
  );
}
