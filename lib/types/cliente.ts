// Tipos das linhas do Supabase usadas pelo dashboard do cliente.
// Espelham supabase/schema.sql — sem geração automática de tipos no projeto,
// então mantidos manualmente aqui.

export type Cliente = {
  id: string;
  advisor_id: string;
  nome: string;
  data_nascimento: string | null;
  idade: number | null;
  profissao: string | null;
  estado_civil: string | null;
  esporte_favorito: string | null;
  hobbies: string | null;
  salario_liquido: number | null;
  outras_rendas: unknown;
  renda_mensal: number | null;
  despesa_mensal_base: number | null;
  despesas_temporarias: unknown;
  despesa_mensal: number | null;
  patrimonio_investido: number | null;
  tem_participacao_societaria: boolean;
  valor_participacao: number | null;
  idade_aposentadoria: number | null;
  expectativa_vida: number | null;
  pretensao_salarial_aposentadoria: number | null;
  pretende_adquirir_bens: boolean;
  e_clt: boolean;
  tem_seguro_vida: boolean;
  peso_kg: number | null;
  altura_cm: number | null;
  possui_patologia: boolean;
  patologias: string | null;
  usa_medicamentos: boolean;
  medicamentos: string | null;
  fuma: boolean;
  anda_moto: boolean;
  frequencia_moto: string | null;
  criado_em: string;
  atualizado_em: string;
};

// spouses e children têm exatamente a mesma forma de colunas.
export type PessoaVinculada = {
  id: string;
  client_id: string;
  nome: string;
  data_nascimento: string | null;
  dependente: boolean;
};

export type Propriedade = {
  id: string;
  client_id: string;
  tipo: "imovel" | "automovel";
  valor: number | null;
  financiado: boolean;
  adquirido_apos_casamento: boolean;
};

export type Objetivo = {
  id: string;
  client_id: string;
  prazo: "curto" | "medio" | "longo";
  descricao: string;
  valor_estimado: number | null;
  horizonte_anos: number | null;
};

export type Assumptions = {
  id: string;
  client_id: string;
  // Guardadas como fração (ex: 0.0475 = 4,75%) — ver lib/assumptions.ts pra
  // conversão em percentual, que é o que lib/calculos.ts espera.
  inflacao_projetada: number | null;
  cdi_atual: number | null;
  rentabilidade_real_padrao: number | null;
};

export type ClienteCompleto = {
  cliente: Cliente;
  conjuge: PessoaVinculada | null;
  filhos: PessoaVinculada[];
  imoveis: Propriedade[];
  automoveis: Propriedade[];
  objetivos: Objetivo[];
  assumptions: Assumptions | null;
};
