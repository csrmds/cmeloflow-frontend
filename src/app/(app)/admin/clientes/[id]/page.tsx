"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ClientForm } from "@/components/shared/client-form";
import { ClientPhones } from "@/components/shared/client-phones";
import { AuthGuard } from "@/components/shared/auth-guard";
import { api, extractErrorMessage } from "@/lib/api";
import type { Client } from "@/lib/types";

function EditarClienteContent({ id }: { id: number }) {
  const [client, setClient] = React.useState<Client | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get<Client>(`/clients/${id}`);
        if (!cancelled) setClient(res.data);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, "Erro ao carregar."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Editar Cliente"
        description="Atualize as informações e gerencie os telefones."
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : client ? (
        <>
          <ClientForm client={client} />
          <ClientPhones clientId={client.id} />
        </>
      ) : null}
    </div>
  );
}

export default function EditarClientePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return (
    <AuthGuard requireRole="admin">
      <EditarClienteContent id={id} />
    </AuthGuard>
  );
}
