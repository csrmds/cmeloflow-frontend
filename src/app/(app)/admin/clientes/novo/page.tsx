"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ClientForm } from "@/components/shared/client-form";
import { AuthGuard } from "@/components/shared/auth-guard";

export default function NovoClientePage() {
  return (
    <AuthGuard requireRole="admin">
      <div className="max-w-3xl">
        <PageHeader
          title="Novo Cliente"
          description="Cadastre um novo cliente na plataforma."
        />
        <ClientForm />
      </div>
    </AuthGuard>
  );
}
