"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/shared/product-form";

export default function NovoProdutoPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Novo Produto"
        description="Cadastre um novo produto ou serviço."
      />
      <ProductForm />
    </div>
  );
}
