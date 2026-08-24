"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { booleano } from "@/lib/form-data";
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

export async function atualizarCliente(formData: FormData) {
  const clientId = texto(formData, "clientId");
  if (!clientId) return;

  const camposTexto = [
    "nome",
    "data_nascimento",
    "profissao",
    "estado_civil",
    "esporte_favorito",
    "hobbies",
    "patologias",
    "medicamentos",
    "frequencia_moto",
  ];
  const camposNumero = [
    "renda_mensal",
    "despesa_mensal_base",
    "despesa_mensal",
    "peso_kg",
    "altura_cm",
    "idade_aposentadoria",
    "expectativa_vida",
    "pretensao_salarial_aposentadoria",
  ];
  const camposBooleanos = [
    "e_clt",
    "possui_patologia",
    "usa_medicamentos",
    "fuma",
    "anda_moto",
  ];

  const update: Record<string, string | number | boolean | null> = {};
  for (const campo of camposTexto) if (formData.has(campo)) update[campo] = texto(formData, campo);
  for (const campo of camposNumero) if (formData.has(campo)) update[campo] = numero(formData, campo);
  for (const campo of camposBooleanos) if (formData.has(campo)) update[campo] = booleano(formData, campo);
  if (Object.keys(update).length === 0 || update.nome === null) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("clients").update(update).eq("id", clientId).eq("advisor_id", user.id);

  revalidatePath(`/carteira/${clientId}`);
}

export const atualizarDadosPessoais = atualizarCliente;

async function clienteDoAdvisor(clientId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: cliente } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("advisor_id", user.id)
    .maybeSingle<{ id: string }>();
  return cliente ? supabase : null;
}

export async function atualizarPessoaVinculada(formData: FormData) {
  const clientId = texto(formData, "clientId");
  const pessoaId = texto(formData, "pessoaId");
  const tabela = texto(formData, "tabela");
  const nome = texto(formData, "nome");
  if (!clientId || !pessoaId || !nome || (tabela !== "spouses" && tabela !== "children")) return;

  const supabase = await clienteDoAdvisor(clientId);
  if (!supabase) return;

  await supabase
    .from(tabela)
    .update({
      nome,
      data_nascimento: texto(formData, "data_nascimento"),
      dependente: booleano(formData, "dependente"),
    })
    .eq("id", pessoaId)
    .eq("client_id", clientId);

  revalidatePath(`/carteira/${clientId}`);
}

export async function removerPessoaVinculada(formData: FormData) {
  const clientId = texto(formData, "clientId");
  const pessoaId = texto(formData, "pessoaId");
  const tabela = texto(formData, "tabela");
  if (!clientId || !pessoaId || (tabela !== "spouses" && tabela !== "children")) return;

  const supabase = await clienteDoAdvisor(clientId);
  if (!supabase) return;

  await supabase.from(tabela).delete().eq("id", pessoaId).eq("client_id", clientId);
  revalidatePath(`/carteira/${clientId}`);
}

export async function adicionarFilho(formData: FormData) {
  const clientId = texto(formData, "clientId");
  const nome = texto(formData, "nome");
  if (!clientId || !nome) return;

  const supabase = await clienteDoAdvisor(clientId);
  if (!supabase) return;

  await supabase.from("children").insert({
    client_id: clientId,
    nome,
    data_nascimento: texto(formData, "data_nascimento"),
    dependente: booleano(formData, "dependente"),
  });
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
