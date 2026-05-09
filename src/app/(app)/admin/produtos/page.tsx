"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import {
	Table,
	TableBody,
	TableCell,
	TableEmpty,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { AuthGuard } from "@/components/shared/auth-guard";
import { api, extractErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";
//import { listAllProducts, type AdminProductRow, } from "@/lib/services/admin-products";

const currency = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

function truncate(s: string | null, n = 80) {
	if (!s) return "—";
	return s.length > n ? s.slice(0, n) + "…" : s;
}

function AdminProdutosContent() {
	const router = useRouter();
	const [items, setItems] = React.useState<Product[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const res = await api.get<Product[]>("/products");
				console.log("Res: ", res.data)
				if (!cancelled) setItems(res.data);
			} catch (err) {
				if (!cancelled) setError(extractErrorMessage(err, "Erro ao carregar produtos."));
			} finally {
				if (!cancelled) setLoading(false)
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div>
			<PageHeader
				title="Todos os Produtos"
				description="Produtos cadastrados por todos os clientes da plataforma."
			/>

			{error && <p className="mb-4 text-sm text-destructive">{error}</p>}

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nome</TableHead>
						<TableHead>Cliente</TableHead>
						<TableHead>Descrição</TableHead>
						<TableHead className="w-32">Preço</TableHead>
						<TableHead className="w-28">Tipo</TableHead>
						<TableHead className="w-26">Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableEmpty colSpan={6}>Carregando…</TableEmpty>
					) : items.length === 0 ? (
						<TableEmpty colSpan={6}>Nenhum produto encontrado.</TableEmpty>
					) : (
						items.map((p) => (
							<TableRow
								key={`${p.client_id}-${p.id}`}
								onClick={() => router.push(`/admin/produtos/${p.id}`)}
								className="cursor-pointer"
							>
								<TableCell className="font-medium">{p.name}</TableCell>
								<TableCell>{ p.client_name }</TableCell>
								<TableCell className="text-muted-foreground"> {truncate(p.description)} </TableCell>
								<TableCell> {p.price != null ? currency.format(Number(p.price)) : "—"} </TableCell>
								<TableCell>
									<span className="rounded-md bg-secondary px-2 py-0.5 text-xs">
										{p.type === "servico" ? "Serviço" : "Produto"}
									</span>
								</TableCell>
								<TableCell>
									{Number(p.active) ? (
										<span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
											Ativo
										</span>
									) : (
										<span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
											Inativo
										</span>
									)}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export default function AdminProdutosPage() {
	return (
		<AuthGuard requireRole="admin">
			<AdminProdutosContent />
		</AuthGuard>
	);
}
