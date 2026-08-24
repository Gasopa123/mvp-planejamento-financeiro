import type { WizardFormData } from "./schema";

// Payload em snake_case, espelhando as colunas que a function SQL
// create_client_full espera (ver supabase/migrations/005_dados_pessoais_saude_risco.sql).
//
// Vive fora de app/carteira/novo/actions.ts (que é "use server") de
// propósito: um arquivo "use server" só pode exportar async functions, então
// essa função pura precisa morar num módulo comum pra poder ser importada
// tanto pela Server Action quanto por testes de regressão sem violar essa
// regra do Next.js.
export function toDbPayload(data: WizardFormData) {
  return {
    nome: data.nome,
    data_nascimento: data.dataNascimento,
    idade: data.idade,
    profissao: data.profissao,
    estado_civil: data.estadoCivil,
    esporte_favorito: data.esporteFavorito,
    hobbies: data.hobbies,
    salario_liquido: data.salarioLiquido,
    outras_rendas: data.outrasRendas.map((renda) => ({
      descricao: renda.descricao,
      valor: renda.valor,
      frequencia: renda.frequencia,
      termino_em: renda.terminoEm,
    })),
    renda_mensal: data.rendaMensal,
    despesa_mensal_base: data.despesaMensalBase,
    despesas_temporarias: data.despesasTemporarias.map((despesa) => ({
      descricao: despesa.descricao,
      valor: despesa.valor,
      frequencia: despesa.frequencia,
      termino_em: despesa.terminoEm,
    })),
    despesa_mensal: data.despesaMensal,
    patrimonio_investido: data.patrimonioInvestido,
    local_aplicado: data.localAplicado,
    tem_investimento_exterior: data.temInvestimentoExterior,
    valor_investimento_exterior: data.valorInvestimentoExterior,
    tem_participacao_societaria: data.temParticipacaoSocietaria,
    valor_participacao: data.valorParticipacao,
    idade_aposentadoria: data.idadeAposentadoria,
    expectativa_vida: data.expectativaVida,
    pretensao_salarial_aposentadoria: data.pretensaoSalarialAposentadoria,
    pretende_adquirir_bens: data.pretendeAdquirirBens,
    e_clt: data.eClt,
    tem_seguro_vida: data.temSeguroVida,
    peso_kg: data.pesoKg,
    altura_cm: data.alturaCm,
    possui_patologia: data.possuiPatologia,
    patologias: data.patologias,
    usa_medicamentos: data.usaMedicamentos,
    medicamentos: data.medicamentos,
    fuma: data.fuma,
    anda_moto: data.andaMoto,
    frequencia_moto: data.frequenciaMoto,
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
      subtipo: imovel.subtipo,
      modelo: imovel.modelo,
      financiamento_termino: imovel.financiamentoTermino,
      parcela_financiamento: imovel.parcelaFinanciamento,
    })),
    automoveis: data.automoveis.map((automovel) => ({
      valor: automovel.valor,
      financiado: automovel.financiado,
      adquirido_apos_casamento: automovel.adquiridoAposCasamento,
      subtipo: automovel.subtipo,
      modelo: automovel.modelo,
      financiamento_termino: automovel.financiamentoTermino,
      parcela_financiamento: automovel.parcelaFinanciamento,
    })),
    objetivos: data.objetivos.map((objetivo) => ({
      prazo: objetivo.prazo,
      descricao: objetivo.descricao,
      valor_estimado: objetivo.valorEstimado,
      horizonte_anos: objetivo.horizonteAnos,
    })),
  };
}
