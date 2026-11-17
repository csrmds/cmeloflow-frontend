"use client";

import { PageHeader } from "@/components/shared/page-header";
import { SalesList } from "@/components/shared/sales-list";

export default function AdminVendasPage() {
	return (
		<div>
			<PageHeader
				title="Vendas"
				description="Vendas registradas por todos os clientes."
			/>
			<SalesList isAdmin />
		</div>
	);
}
