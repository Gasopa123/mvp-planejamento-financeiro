import type { EstadoCivil, Prazo } from "./schema";

// Espelha WizardFormData, mas com os campos numéricos/enum ainda "vazios"
// (null / "") enquanto o advisor preenche o wizard. Só depois de validado
// por wizardFormSchema é que os campos ficam garantidamente preenchidos.

export type PessoaDraft = {
  nome: string;
  dataNascimento: string | null;
  dependente: boolean;
};

export type PropriedadeDraft = {
  valor: number | null;
  financiado: boolean;
  adquiridoAposCasamento: boolean;
};

export type ObjetivoDraft = {
  prazo: Prazo | "";
  descricao: string;
  valorEstimado: number | null;
  horizonteAnos: number | null;
};

export type WizardDraft = {
  nome: string;
  dataNascimento: string;
  idade: number | null;
  profissao: string;
  estadoCivil: EstadoCivil | "";
  conjuge: PessoaDraft | null;
  filhos: PessoaDraft[];
  esporteFavorito: string;
  hobbies: string;
  rendaMensal: number | null;
  despesaMensal: number | null;
  patrimonioInvestido: number | null;
  imoveis: PropriedadeDraft[];
  automoveis: PropriedadeDraft[];
  objetivos: ObjetivoDraft[];
  temParticipacaoSocietaria: boolean;
  valorParticipacao: number | null;
  idadeAposentadoria: number | null;
  expectativaVida: number | null;
  pretensaoSalarialAposentadoria: number | null;
  pretendeAdquirirBens: boolean;
  eClt: boolean;
  temSeguroVida: boolean;
};

export function criarPessoaVazia(): PessoaDraft {
  return { nome: "", dataNascimento: null, dependente: false };
}

export function criarPropriedadeVazia(): PropriedadeDraft {
  return { valor: null, financiado: false, adquiridoAposCasamento: false };
}

export function criarObjetivoVazio(): ObjetivoDraft {
  return { prazo: "", descricao: "", valorEstimado: null, horizonteAnos: null };
}

export function criarWizardDraftInicial(): WizardDraft {
  return {
    nome: "",
    dataNascimento: "",
    idade: null,
    profissao: "",
    estadoCivil: "",
    conjuge: null,
    filhos: [],
    esporteFavorito: "",
    hobbies: "",
    rendaMensal: null,
    despesaMensal: null,
    patrimonioInvestido: null,
    imoveis: [],
    automoveis: [],
    objetivos: [],
    temParticipacaoSocietaria: false,
    valorParticipacao: null,
    idadeAposentadoria: null,
    expectativaVida: null,
    pretensaoSalarialAposentadoria: null,
    pretendeAdquirirBens: false,
    eClt: false,
    temSeguroVida: false,
  };
}

export type StepId =
  | "pessoal"
  | "financeiro"
  | "patrimonio"
  | "objetivos"
  | "societario"
  | "aposentadoria"
  | "planos-futuros";

// Cônjuge, filhos e estilo de vida não são mais etapas próprias do
// wizard: viraram subtópicos dentro de "Dados pessoais" (ver StepPessoal).
export const WIZARD_STEPS: { id: StepId; label: string }[] = [
  { id: "pessoal", label: "Dados pessoais" },
  { id: "financeiro", label: "Financeiro" },
  { id: "patrimonio", label: "Patrimônio" },
  { id: "objetivos", label: "Objetivos" },
  { id: "societario", label: "Participação societária" },
  { id: "aposentadoria", label: "Aposentadoria" },
  { id: "planos-futuros", label: "Planos futuros" },
];
