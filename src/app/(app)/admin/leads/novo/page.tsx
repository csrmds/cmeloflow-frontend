"use client";

import { PageHeader } from "@/components/shared/page-header";
import { LeadForm } from "@/components/shared/lead-form";
import { AuthGuard } from "@/components/shared/auth-guard";

export default function AdminNovoLeadPage() {
  return (
    <AuthGuard requireRole="admin">
      <div className="max-w-3xl">
        <PageHeader title="Novo Lead" description="Cadastre um lead manualmente." />
        <LeadForm redirectAfter="/admin/leads" showClientField />
      </div>
    </AuthGuard>
  );
}
