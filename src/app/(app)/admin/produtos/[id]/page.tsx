"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/shared/product-form";
import { AuthGuard } from "@/components/shared/auth-guard";
import type { Product } from "@/lib/types";
import { api, extractErrorMessage } from "@/lib/api";

function AdminEditarProdutoContent({ id }: { id: number }) {
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
		try {
			const res = await api.get<Product>(`/products/${id}`)
			//console.log("Res.data: ", res.data)
			if (!cancelled) setProduct(res.data.data[0])
		} catch (err) {
			if (!cancelled) setError(extractErrorMessage(err, "Erro ao carregar produto"))
		} finally {
			if (!cancelled) setLoading(false)
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
