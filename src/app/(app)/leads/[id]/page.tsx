"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { LeadForm } from "@/components/shared/lead-form";
import { getLead, type NormalizedLead } from "@/lib/services/leads";

export default function EditarLeadPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [lead, setLead] = React.useState<NormalizedLead | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await getLead(id);
      if (!cancelled) {
        setLead(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Editar Lead" description="Atualize as informações do lead." />
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : lead ? (
        <LeadForm lead={lead} />
      ) : (
        <p className="text-sm text-destructive">Lead não encontrado.</p>
      )}
    </div>
  );
}
