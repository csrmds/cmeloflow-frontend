"use client";

import { PageHeader } from "@/components/shared/page-header";
import { LeadForm } from "@/components/shared/lead-form";

export default function NovoLeadPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Novo Lead" description="Cadastre um novo lead." />
      <LeadForm />
    </div>
  );
}
