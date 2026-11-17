"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SaleDetail } from "@/components/shared/sale-detail";
import { SaleForm } from "@/components/shared/sale-form";
import { api, extractErrorMessage } from "@/lib/api";
import { useUserStore } from "@/lib/stores/user-store";
import type { ApiResponse, SaleDetail as SaleDetailType } from "@/lib/types";

export default function VendaPage() {
	const params = useParams<{ id: string }>();
	const id = params.id;
	const role = useUserStore((s) => s.role());

	const [sale, setSale] = React.useState<SaleDetailType | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const load = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get<ApiResponse<SaleDetailType>>(`/sales/${id}`);
			setSale(res.data.data);
		} catch (err) {
			setError(extractErrorMessage(err, "Erro ao carregar a venda."));
		} finally {
			setLoading(false);
		}
	}, [id]);

	React.useEffect(() => {
		load();
	}, [load]);

	const isAdmin = role === "admin";

	return (
		<div className="max-w-4xl">
			<PageHeader
				title={sale ? `Venda #${sale.number}` : "Venda"}
				description={
					sale?.status === "open"
						? "Edite os itens, finalize ou cancele a venda."
						: "Detalhes da venda."
				}
			/>

			{loading && <p className="text-sm text-muted-foreground">Carregando…</p>}
			{error && <p className="text-sm text-destructive">{error}</p>}

			{!loading && sale && sale.status === "open" && (
				<SaleForm sale={sale} redirectAfter={isAdmin ? "/admin/vendas" : "/vendas"} />
			)}
			{!loading && sale && sale.status !== "open" && (
				<SaleDetail sale={sale} isAdmin={isAdmin} onChanged={load} />
			)}
		</div>
	);
}
