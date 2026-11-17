"use client";

import { PageHeader } from "@/components/shared/page-header";
import { SaleForm } from "@/components/shared/sale-form";

export default function NovaVendaPage() {
	return (
		<div className="max-w-4xl">
			<PageHeader title="Nova Venda" description="Registre uma venda com seus itens." />
			<SaleForm />
		</div>
	);
}
