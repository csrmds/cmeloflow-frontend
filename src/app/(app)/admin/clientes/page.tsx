"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { AuthGuard } from "@/components/shared/auth-guard";
import { api, extractErrorMessage } from "@/lib/api";
import type { Client } from "@/lib/types";

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
      new Date(value)
    );
  } catch {
    return value;
  }
}

function ClientesContent() {
  const router = useRouter();
  const [items, setItems] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get<Client[]>("/clients");
        if (!cancelled) setItems(res.data);
      } catch (err) {
        if (!cancelled)
          setError(extractErrorMessage(err, "Erro ao carregar clientes."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Todos os clientes cadastrados na plataforma."
        actions={
          <Button asChild>
            <Link href="/admin/clientes/novo">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        }
      />

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Instagram</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-32">Criado em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableEmpty colSpan={6}>Carregando…</TableEmpty>
          ) : items.length === 0 ? (
            <TableEmpty colSpan={6}>Nenhum cliente cadastrado.</TableEmpty>
          ) : (
            items.map((c) => (
              <TableRow
                key={c.id}
                onClick={() => router.push(`/admin/clientes/${c.id}`)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium">{c.id || "—"}</TableCell>
                <TableCell className="font-medium">{c.name || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{c.email || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{c.whatsapp_number || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{c.instagram_username || "—"}</TableCell>
                <TableCell>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{c.status || "—"}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(c.created_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ClientesPage() {
  return (
    <AuthGuard requireRole="admin">
      <ClientesContent />
    </AuthGuard>
  );
}
