import { Card, CardLabel } from "@/components/design-system/card";
import { Badge } from "@/components/design-system/badge";
import { IconChip } from "@/components/design-system/icon-chip";
import { IconUsers } from "@/components/design-system/icons";
import { ESTADO_CIVIL_LABELS, type EstadoCivil } from "@/lib/wizard/schema";
import { calcularIdade } from "@/lib/idade";
import { atualizarCliente, atualizarPessoaVinculada } from "@/app/carteira/[clientId]/actions";
import type { Cliente, PessoaVinculada } from "@/lib/types/cliente";

type PerfilTabProps = {
  cliente: Cliente;
  conjuge: PessoaVinculada | null;
  filhos: PessoaVinculada[];
};

function labelEstadoCivil(estadoCivil: string | null): string {
  if (!estadoCivil) return "não informado";
  return ESTADO_CIVIL_LABELS[estadoCivil as EstadoCivil] ?? estadoCivil;
}

function Editar() {
  return (
    <summary className="mt-4 cursor-pointer rounded-full border border-line px-3 py-1.5 text-center text-sm font-semibold text-navy hover:bg-blue-soft">
      Editar
    </summary>
  );
}

function PessoaRow({ pessoa }: { pessoa: PessoaVinculada }) {
  const idade = pessoa.data_nascimento ? calcularIdade(pessoa.data_nascimento) : null;
  return (
    <div className="flex items-center justify-between border-b border-line py-3 last:border-0">
      <div>
        <p className="font-medium text-navy">{pessoa.nome}</p>
        <p className="text-sm text-ink-60">
          {idade != null ? `${idade} anos` : "Data de nascimento não informada"}
        </p>
      </div>
      {pessoa.dependente && <Badge tone="blue">Dependente</Badge>}
    </div>
  );
}

function PessoaForm({ clienteId, pessoa, tabela }: { clienteId: string; pessoa: PessoaVinculada; tabela: "spouses" | "children" }) {
  return (
    <form action={atualizarPessoaVinculada} className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
      <input type="hidden" name="clientId" value={clienteId} />
      <input type="hidden" name="pessoaId" value={pessoa.id} />
      <input type="hidden" name="tabela" value={tabela} />
      <label className="space-y-1">
        <span className="font-medium text-ink-60">Nome</span>
        <input name="nome" required defaultValue={pessoa.nome} className="w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="space-y-1">
        <span className="font-medium text-ink-60">Nascimento</span>
        <input type="date" name="data_nascimento" defaultValue={pessoa.data_nascimento ?? ""} className="w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-ink-60">
        <input type="hidden" name="dependente" value="off" />
        <input type="checkbox" name="dependente" defaultChecked={pessoa.dependente} />
        Dependente
      </label>
      <button type="submit" className="rounded-full bg-navy px-4 py-2 font-semibold text-white sm:justify-self-end">
        Salvar
      </button>
    </form>
  );
}

export function PerfilTab({ cliente, conjuge, filhos }: PerfilTabProps) {
  const idadeCliente = cliente.data_nascimento
    ? calcularIdade(cliente.data_nascimento)
    : cliente.idade;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardLabel>Dados pessoais</CardLabel>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-ink-60">Nome</dt><dd className="font-display font-semibold text-navy">{cliente.nome}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-60">Idade</dt><dd className="font-display font-semibold text-navy">{idadeCliente != null ? `${idadeCliente} anos` : "não informado"}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-60">Profissão</dt><dd className="text-right font-display font-semibold text-navy">{cliente.profissao || "não informado"}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-60">Regime</dt><dd className="font-display font-semibold text-navy">{cliente.e_clt ? "CLT" : "Não CLT"}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-60">Estado civil</dt><dd className="font-display font-semibold text-navy">{labelEstadoCivil(cliente.estado_civil)}</dd></div>
        </dl>
        <details>
          <Editar />
          <form action={atualizarCliente} className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <input type="hidden" name="clientId" value={cliente.id} />
            <label className="space-y-1"><span className="font-medium text-ink-60">Nome</span><input name="nome" required defaultValue={cliente.nome} className="w-full rounded-xl border border-line px-3 py-2" /></label>
            <label className="space-y-1"><span className="font-medium text-ink-60">Nascimento</span><input type="date" name="data_nascimento" defaultValue={cliente.data_nascimento ?? ""} className="w-full rounded-xl border border-line px-3 py-2" /></label>
            <label className="space-y-1"><span className="font-medium text-ink-60">Profissão</span><input name="profissao" defaultValue={cliente.profissao ?? ""} className="w-full rounded-xl border border-line px-3 py-2" /></label>
            <label className="space-y-1"><span className="font-medium text-ink-60">Estado civil</span><select name="estado_civil" defaultValue={cliente.estado_civil ?? ""} className="w-full rounded-xl border border-line px-3 py-2"><option value="">Não informado</option>{Object.entries(ESTADO_CIVIL_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="flex items-center gap-2 text-ink-60"><input type="hidden" name="e_clt" value="off" /><input type="checkbox" name="e_clt" defaultChecked={cliente.e_clt} />CLT</label>
            <button type="submit" className="rounded-full bg-navy px-4 py-2 font-semibold text-white sm:justify-self-end">Salvar</button>
          </form>
        </details>
      </Card>

      <Card>
        <CardLabel>Estilo de vida</CardLabel>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-ink-60">Esporte favorito</dt><dd className="text-right font-medium text-navy">{cliente.esporte_favorito || "não informado"}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-60">Hobbies</dt><dd className="text-right font-medium text-navy">{cliente.hobbies || "não informado"}</dd></div>
        </dl>
        <details>
          <Editar />
          <form action={atualizarCliente} className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <input type="hidden" name="clientId" value={cliente.id} />
            <label className="space-y-1"><span className="font-medium text-ink-60">Esporte favorito</span><input name="esporte_favorito" defaultValue={cliente.esporte_favorito ?? ""} className="w-full rounded-xl border border-line px-3 py-2" /></label>
            <label className="space-y-1"><span className="font-medium text-ink-60">Hobbies</span><input name="hobbies" defaultValue={cliente.hobbies ?? ""} className="w-full rounded-xl border border-line px-3 py-2" /></label>
            <button type="submit" className="rounded-full bg-navy px-4 py-2 font-semibold text-white sm:col-start-2 sm:justify-self-end">Salvar</button>
          </form>
        </details>
      </Card>

      <Card>
        <CardLabel>Saúde e risco</CardLabel>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-ink-60">Peso</dt><dd className="font-display font-semibold text-navy">{cliente.peso_kg != null ? `${cliente.peso_kg} kg` : "não informado"}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-60">Altura</dt><dd className="font-display font-semibold text-navy">{cliente.altura_cm != null ? `${cliente.altura_cm} cm` : "não informado"}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-60">Patologias</dt><dd className="text-right font-medium text-navy">{cliente.possui_patologia ? cliente.patologias || "não informado" : "Não possui"}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-60">Medicamentos</dt><dd className="text-right font-medium text-navy">{cliente.usa_medicamentos ? cliente.medicamentos || "não informado" : "Não usa"}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-60">Fuma</dt><dd className="font-display font-semibold text-navy">{cliente.fuma ? "Sim" : "Não"}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-60">Anda de moto</dt><dd className="text-right font-medium text-navy">{cliente.anda_moto ? cliente.frequencia_moto || "Sim" : "Não"}</dd></div>
        </dl>
        <details>
          <Editar />
          <form action={atualizarCliente} className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <input type="hidden" name="clientId" value={cliente.id} />
            <label className="space-y-1"><span className="font-medium text-ink-60">Peso</span><input name="peso_kg" defaultValue={cliente.peso_kg ?? ""} className="w-full rounded-xl border border-line px-3 py-2" /></label>
            <label className="space-y-1"><span className="font-medium text-ink-60">Altura</span><input name="altura_cm" defaultValue={cliente.altura_cm ?? ""} className="w-full rounded-xl border border-line px-3 py-2" /></label>
            <label className="flex items-center gap-2 text-ink-60"><input type="hidden" name="possui_patologia" value="off" /><input type="checkbox" name="possui_patologia" defaultChecked={cliente.possui_patologia} />Possui patologia</label>
            <input name="patologias" defaultValue={cliente.patologias ?? ""} placeholder="Patologias" className="w-full rounded-xl border border-line px-3 py-2" />
            <label className="flex items-center gap-2 text-ink-60"><input type="hidden" name="usa_medicamentos" value="off" /><input type="checkbox" name="usa_medicamentos" defaultChecked={cliente.usa_medicamentos} />Usa medicamentos</label>
            <input name="medicamentos" defaultValue={cliente.medicamentos ?? ""} placeholder="Medicamentos" className="w-full rounded-xl border border-line px-3 py-2" />
            <label className="flex items-center gap-2 text-ink-60"><input type="hidden" name="fuma" value="off" /><input type="checkbox" name="fuma" defaultChecked={cliente.fuma} />Fuma</label>
            <label className="flex items-center gap-2 text-ink-60"><input type="hidden" name="anda_moto" value="off" /><input type="checkbox" name="anda_moto" defaultChecked={cliente.anda_moto} />Anda de moto</label>
            <input name="frequencia_moto" defaultValue={cliente.frequencia_moto ?? ""} placeholder="Frequência da moto" className="w-full rounded-xl border border-line px-3 py-2" />
            <button type="submit" className="rounded-full bg-navy px-4 py-2 font-semibold text-white sm:justify-self-end">Salvar</button>
          </form>
        </details>
      </Card>

      {conjuge && (
        <Card>
          <CardLabel>Cônjuge</CardLabel>
          <PessoaRow pessoa={conjuge} />
          <details><Editar /><PessoaForm clienteId={cliente.id} pessoa={conjuge} tabela="spouses" /></details>
        </Card>
      )}

      <Card>
        <IconChip tone="blue"><IconUsers /></IconChip>
        <CardLabel>Filhos</CardLabel>
        {filhos.length === 0 ? <p className="text-sm text-ink-60">Nenhum filho cadastrado.</p> : <div>{filhos.map((filho) => <PessoaRow key={filho.id} pessoa={filho} />)}</div>}
        {filhos.map((filho) => <details key={`editar-${filho.id}`}><Editar /><PessoaForm clienteId={cliente.id} pessoa={filho} tabela="children" /></details>)}
      </Card>
    </div>
  );
}
