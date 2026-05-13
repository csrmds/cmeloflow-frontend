"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
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
import { api, extractErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";

const currency = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

function truncate(s: string | null, n = 80) {
	if (!s) return "—";
	return s.length > n ? s.slice(0, n) + "…" : s;
}

export default function ProdutosPage() {
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
				if (!cancelled) setItems(res.data);
			} catch (err) {
				if (!cancelled) setError(extractErrorMessage(err, "Erro ao carregar produtos."));
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
				title="Produtos"
				description="Gerencie seus produtos e serviços oferecidos."
				actions={
					<Button asChild>
						<Link href="/produtos/novo">
							<Plus className="h-4 w-4" />
							Novo Produto
						</Link>
					</Button>
				}
			/>

			{error && <p className="mb-4 text-sm text-destructive">{error}</p>}

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nome</TableHead>
						<TableHead>Descrição</TableHead>
						<TableHead className="w-32">Preço</TableHead>
						<TableHead className="w-28">Tipo</TableHead>
						<TableHead className="w-26">Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableEmpty colSpan={5}>Carregando…</TableEmpty>
					) : items.length === 0 ? (
						<TableEmpty colSpan={5}>Nenhum produto cadastrado.</TableEmpty>
					) : (
						items.map((p) => (
							<TableRow
								key={p.id}
								onClick={() => router.push(`/produtos/${p.id}`)}
								className="cursor-pointer"
							>
								<TableCell className="font-medium">{p.name}</TableCell>
								<TableCell className="text-muted-foreground">
									{truncate(p.description)}
								</TableCell>
								<TableCell>
									{p.price != null ? currency.format(Number(p.price)) : "—"}
								</TableCell>
								<TableCell>
									<span className="rounded-md bg-secondary px-2 py-0.5 text-xs capitalize">
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
