import { Card, CardLabel } from "@/components/design-system/card";
import { Badge } from "@/components/design-system/badge";
import { IconChip } from "@/components/design-system/icon-chip";
import { IconUsers } from "@/components/design-system/icons";
import { ESTADO_CIVIL_LABELS, type EstadoCivil } from "@/lib/wizard/schema";
import { calcularIdade } from "@/lib/idade";
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
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
              {cliente.idade != null ? `${cliente.idade} anos` : "não informado"}
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
