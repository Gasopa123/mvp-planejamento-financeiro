"use server";

import { createClient } from "@/lib/supabase/server";
import { wizardFormSchema, type WizardFormData } from "@/lib/wizard/schema";
import { toDbPayload } from "@/lib/wizard/to-db-payload";

export async function createClienteCompleto(data: WizardFormData) {
  // Revalidação server-side — defesa em profundidade além da validação
  // já feita no client antes de chegar aqui.
  const parsed = wizardFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise as etapas do formulário." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { data: clientId, error } = await supabase.rpc("create_client_full", {
    payload: toDbPayload(parsed.data),
  });

  if (error) {
    return { error: "Não foi possível salvar o cliente. Tente novamente." };
  }

  return { error: null, clientId: clientId as string };
}
