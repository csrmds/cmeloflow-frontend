"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { LeadTable } from "@/components/shared/lead-table";
import { AuthGuard } from "@/components/shared/auth-guard";
import { ClientLeadView, ApiResponse } from "@/lib/types"; 
import { api } from "@/lib/api";
//import { listLeads, type NormalizedLead } from "@/lib/services/leads";

function AdminLeadsContent() {
  const [items, setItems] = React.useState<ClientLeadView[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await api.get<ApiResponse<ClientLeadView[]>>("/leads");
      //console.log("res.data: ", res.data)
      if (!cancelled) {
        setItems(res.data.data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Todos os Leads"
        description="Visualize os leads de todos os clientes da plataforma."
        actions={
          <Button asChild>
            <Link href="/admin/leads/novo">
              <Plus className="h-4 w-4" />
              Novo Lead
            </Link>
          </Button>
        }
      />
      <LeadTable
        leads={items}
        loading={loading}
        showClient
        basePath="/admin/leads"
      />
    </div>
  );
}

export default function AdminLeadsPage() {
  return (
    <AuthGuard requireRole="admin">
      <AdminLeadsContent />
    </AuthGuard>
  );
}
