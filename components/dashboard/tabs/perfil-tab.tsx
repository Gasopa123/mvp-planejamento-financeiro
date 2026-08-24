import { Card, CardLabel } from "@/components/design-system/card";
import { Badge } from "@/components/design-system/badge";
import { IconChip } from "@/components/design-system/icon-chip";
import { IconUsers } from "@/components/design-system/icons";
import { ESTADO_CIVIL_LABELS, type EstadoCivil } from "@/lib/wizard/schema";
import { calcularIdade } from "@/lib/idade";
import { atualizarDadosPessoais } from "@/app/carteira/[clientId]/actions";
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

export function PerfilTab({ cliente, conjuge, filhos }: PerfilTabProps) {
  const idadeCliente = cliente.data_nascimento
    ? calcularIdade(cliente.data_nascimento)
    : cliente.idade;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

      <Card className="md:col-span-2">
        <CardLabel>Alterar dados pessoais</CardLabel>
        <form action={atualizarDadosPessoais} className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <input type="hidden" name="clientId" value={cliente.id} />
          <label className="space-y-1">
            <span className="font-medium text-ink-60">Nome</span>
            <input name="nome" required defaultValue={cliente.nome} className="w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-ink-60">Nascimento</span>
            <input type="date" name="data_nascimento" defaultValue={cliente.data_nascimento ?? ""} className="w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-ink-60">Profissão</span>
            <input name="profissao" defaultValue={cliente.profissao ?? ""} className="w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-ink-60">Estado civil</span>
            <select name="estado_civil" defaultValue={cliente.estado_civil ?? ""} className="w-full rounded-xl border border-line px-3 py-2">
              <option value="">Não informado</option>
              {Object.entries(ESTADO_CIVIL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-medium text-ink-60">Esporte favorito</span>
            <input name="esporte_favorito" defaultValue={cliente.esporte_favorito ?? ""} className="w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span className="font-medium text-ink-60">Hobbies</span>
            <input name="hobbies" defaultValue={cliente.hobbies ?? ""} className="w-full rounded-xl border border-line px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-ink-60">
            <input type="checkbox" name="e_clt" defaultChecked={cliente.e_clt} />
            CLT
          </label>
          <button type="submit" className="rounded-full bg-navy px-4 py-2 font-semibold text-white sm:justify-self-end">
            Salvar dados pessoais
          </button>
        </form>
      </Card>
      <Card>
        <CardLabel>Dados pessoais</CardLabel>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-60">Nome</dt>
            <dd className="font-display font-semibold text-navy">{cliente.nome}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-60">Idade</dt>
            <dd className="font-display font-semibold text-navy">
              {idadeCliente != null ? `${idadeCliente} anos` : "não informado"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-60">Profissão</dt>
            <dd className="text-right font-display font-semibold text-navy">
              {cliente.profissao || "não informado"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-60">Regime</dt>
            <dd className="font-display font-semibold text-navy">
              {cliente.e_clt ? "CLT" : "Não CLT"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-60">Estado civil</dt>
            <dd className="font-display font-semibold text-navy">
              {labelEstadoCivil(cliente.estado_civil)}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardLabel>Estilo de vida</CardLabel>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-60">Esporte favorito</dt>
            <dd className="text-right font-medium text-navy">
              {cliente.esporte_favorito || "não informado"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-60">Hobbies</dt>
            <dd className="text-right font-medium text-navy">
              {cliente.hobbies || "não informado"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardLabel>Saúde e risco</CardLabel>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-60">Peso</dt>
            <dd className="font-display font-semibold text-navy">
              {cliente.peso_kg != null ? `${cliente.peso_kg} kg` : "não informado"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-60">Altura</dt>
            <dd className="font-display font-semibold text-navy">
              {cliente.altura_cm != null ? `${cliente.altura_cm} cm` : "não informado"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-60">Patologias</dt>
            <dd className="text-right font-medium text-navy">
              {cliente.possui_patologia
                ? cliente.patologias || "não informado"
                : "Não possui"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-60">Medicamentos</dt>
            <dd className="text-right font-medium text-navy">
              {cliente.usa_medicamentos
                ? cliente.medicamentos || "não informado"
                : "Não usa"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-60">Fuma</dt>
            <dd className="font-display font-semibold text-navy">
              {cliente.fuma ? "Sim" : "Não"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-60">Anda de moto</dt>
            <dd className="text-right font-medium text-navy">
              {cliente.anda_moto
                ? cliente.frequencia_moto || "Sim"
                : "Não"}
            </dd>
          </div>
        </dl>
      </Card>

      {conjuge && (
        <Card>
          <CardLabel>Cônjuge</CardLabel>
          <PessoaRow pessoa={conjuge} />
        </Card>
      )}

      <Card>
        <IconChip tone="blue">
          <IconUsers />
        </IconChip>
        <CardLabel>Filhos</CardLabel>
        {filhos.length === 0 ? (
          <p className="text-sm text-ink-60">Nenhum filho cadastrado.</p>
        ) : (
          <div>
            {filhos.map((filho) => (
              <PessoaRow key={filho.id} pessoa={filho} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
