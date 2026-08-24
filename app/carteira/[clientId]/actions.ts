"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { objetivoSchema } from "@/lib/wizard/schema";

function texto(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numero(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export async function atualizarDadosPessoais(formData: FormData) {
  const clientId = texto(formData, "clientId");
  const nome = texto(formData, "nome");
  if (!clientId || !nome) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("clients")
    .update({
      nome,
      data_nascimento: texto(formData, "data_nascimento"),
      profissao: texto(formData, "profissao"),
      estado_civil: texto(formData, "estado_civil"),
      esporte_favorito: texto(formData, "esporte_favorito"),
      hobbies: texto(formData, "hobbies"),
      e_clt: formData.get("e_clt") === "on",
    })
    .eq("id", clientId)
    .eq("advisor_id", user.id);

  revalidatePath(`/carteira/${clientId}`);
}

export async function adicionarObjetivo(formData: FormData) {
  const clientId = texto(formData, "clientId");
  if (!clientId) return;

  const parsed = objetivoSchema.safeParse({
    descricao: texto(formData, "descricao") ?? "",
    prazo: texto(formData, "prazo") ?? "medio",
    valorEstimado: numero(formData, "valor_estimado"),
    horizonteAnos: numero(formData, "horizonte_anos"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: cliente } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("advisor_id", user.id)
    .maybeSingle<{ id: string }>();
  if (!cliente) return;

  await supabase.from("goals").insert({
    client_id: clientId,
    descricao: parsed.data.descricao,
    prazo: parsed.data.prazo,
    valor_estimado: parsed.data.valorEstimado,
    horizonte_anos: parsed.data.horizonteAnos,
  });

  revalidatePath(`/carteira/${clientId}`);
}
