"use server";

import { createClient } from "@/lib/supabase/server";
import { wizardFormSchema, type WizardFormData } from "@/lib/wizard/schema";

// Payload em snake_case, espelhando as colunas que a function SQL
// create_client_full espera (ver supabase/migrations/003_create_client_full.sql).
function toDbPayload(data: WizardFormData) {
  return {
    nome: data.nome,
    idade: data.idade,
    estado_civil: data.estadoCivil,
    esporte_favorito: data.esporteFavorito,
    hobbies: data.hobbies,
    renda_mensal: data.rendaMensal,
    despesa_mensal: data.despesaMensal,
    patrimonio_investido: data.patrimonioInvestido,
    tem_participacao_societaria: data.temParticipacaoSocietaria,
    valor_participacao: data.valorParticipacao,
    idade_aposentadoria: data.idadeAposentadoria,
    expectativa_vida: data.expectativaVida,
    pretensao_salarial_aposentadoria: data.pretensaoSalarialAposentadoria,
    pretende_adquirir_bens: data.pretendeAdquirirBens,
    e_clt: data.eClt,
    tem_seguro_vida: data.temSeguroVida,
    conjuge: data.conjuge
      ? {
          nome: data.conjuge.nome,
          data_nascimento: data.conjuge.dataNascimento,
          dependente: data.conjuge.dependente,
        }
      : null,
    filhos: data.filhos.map((filho) => ({
      nome: filho.nome,
      data_nascimento: filho.dataNascimento,
      dependente: filho.dependente,
    })),
    imoveis: data.imoveis.map((imovel) => ({
      valor: imovel.valor,
      financiado: imovel.financiado,
      adquirido_apos_casamento: imovel.adquiridoAposCasamento,
    })),
    automoveis: data.automoveis.map((automovel) => ({
      valor: automovel.valor,
      financiado: automovel.financiado,
      adquirido_apos_casamento: automovel.adquiridoAposCasamento,
    })),
    objetivos: data.objetivos.map((objetivo) => ({
      prazo: objetivo.prazo,
      descricao: objetivo.descricao,
      valor_estimado: objetivo.valorEstimado,
      horizonte_anos: objetivo.horizonteAnos,
    })),
  };
}

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
