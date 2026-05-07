"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/shared/product-form";
import { api, extractErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function EditarProdutoPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // backend não expõe GET /products/:id — buscamos da listagem.
        const res = await api.get<Product[]>("/products");
        const found = res.data.find((p) => p.id === id) ?? null;
        if (!cancelled) {
          if (!found) setError("Produto não encontrado.");
          setProduct(found);
        }
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
    <div className="max-w-3xl">
      <PageHeader
        title="Editar Produto"
        description="Atualize as informações do produto."
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : product ? (
        <ProductForm product={product} />
      ) : null}
    </div>
  );
}
