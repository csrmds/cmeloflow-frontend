"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/shared/product-form";
import { AuthGuard } from "@/components/shared/auth-guard";
import { listAllProducts } from "@/lib/services/admin-products";
import type { Product } from "@/lib/types";

function AdminEditarProdutoContent({ id }: { id: number }) {
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const all = await listAllProducts();
      const found = all.find((p) => p.id === id) ?? null;
      if (!cancelled) {
        if (!found) setError("Produto não encontrado.");
        setProduct(found);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Editar Produto" description="Atualize as informações do produto." />
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : product ? (
        <ProductForm product={product} redirectAfter="/admin/produtos" />
      ) : null}
    </div>
  );
}

export default function AdminEditarProdutoPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return (
    <AuthGuard requireRole="admin">
      <AdminEditarProdutoContent id={id} />
    </AuthGuard>
  );
}
