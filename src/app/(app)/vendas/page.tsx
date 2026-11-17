"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SalesList } from "@/components/shared/sales-list";
import { Button } from "@/components/ui/button";

export default function VendasPage() {
	return (
		<div>
			<PageHeader
				title="Vendas"
				description="Registre vendas e acompanhe o faturamento dos seus atendimentos."
				actions={
					<Button asChild>
						<Link href="/vendas/nova">
							<Plus className="h-4 w-4" />
							Nova Venda
						</Link>
					</Button>
				}
			/>
			<SalesList />
		</div>
	);
}
