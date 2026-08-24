import { notFound } from "next/navigation";
import { PresentationDashboard } from "@/components/dashboard/presentation-dashboard";
import { createClient } from "@/lib/supabase/server";
import type { Assumptions, Cliente, Objetivo } from "@/lib/types/cliente";

export default async function PresentationPage({
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

  const { data: cliente } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .eq("advisor_id", user.id)
    .maybeSingle<Cliente>();

  if (!cliente) notFound();

  const [{ data: objetivos }, { data: assumptions }] = await Promise.all([
    supabase.from("goals").select("*").eq("client_id", clientId).returns<Objetivo[]>(),
    supabase.from("assumptions").select("*").eq("client_id", clientId).maybeSingle<Assumptions>(),
  ]);

  return <PresentationDashboard cliente={cliente} objetivos={objetivos ?? []} assumptions={assumptions ?? null} />;
}
