"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { formatCents } from "@/lib/utils";
import type { ApiResponse, Sale, SaleDashboardRow } from "@/lib/types";
import { SaleStatusBadge, sourceLabel } from "./sale-status";

const ALL = "all";

interface SalesListProps {
	/** Admin vê vendas de todos os clientes e a coluna Cliente. */
	isAdmin?: boolean;
}

function monthKey(date = new Date()) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(key: string) {
	const [y, m] = key.split("-");
	return `${m}/${y}`;
}

function formatDate(value: string | null) {
	if (!value) return "—";
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

interface MonthSummary {
	month: string;
	count: number;
	revenue: number;
}

export function SalesList({ isAdmin = false }: SalesListProps) {
	const router = useRouter();
	const [sales, setSales] = React.useState<Sale[]>([]);
	const [dashboard, setDashboard] = React.useState<SaleDashboardRow[]>([]);
	const [status, setStatus] = React.useState<string>(ALL);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	// Resumo (dashboard): carrega uma vez
	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await api.get<ApiResponse<SaleDashboardRow[]>>("/sales/dashboard", {
					params: { months: 6 },
				});
				if (!cancelled) setDashboard(res.data.data);
			} catch (err) {
				if (!cancelled) setError(extractErrorMessage(err, "Erro ao carregar o resumo de vendas."));
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	// Lista: recarrega quando o filtro muda
	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const res = await api.get<ApiResponse<Sale[]>>("/sales", {
					params: status === ALL ? {} : { status },
				});
				if (!cancelled) setSales(res.data.data);
			} catch (err) {
				if (!cancelled) setError(extractErrorMessage(err, "Erro ao carregar vendas."));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [status]);

	const months = React.useMemo<MonthSummary[]>(() => {
		const map = new Map<string, MonthSummary>();
		for (const r of dashboard) {
			const cur = map.get(r.month) ?? { month: r.month, count: 0, revenue: 0 };
			cur.count += r.sales_count;
			cur.revenue += r.revenue_cents;
			map.set(r.month, cur);
		}
		return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month));
	}, [dashboard]);

	const current = months.find((m) => m.month === monthKey()) ?? {
		month: monthKey(),
		count: 0,
		revenue: 0,
	};
	const avgTicket = current.count > 0 ? Math.round(current.revenue / current.count) : 0;

	const bySourceThisMonth = dashboard
		.filter((r) => r.month === monthKey())
		.reduce<Record<string, number>>((acc, r) => {
			acc[r.source] = (acc[r.source] ?? 0) + r.revenue_cents;
			return acc;
		}, {});

	const colSpan = isAdmin ? 9 : 8;

	return (
		<div className="space-y-6">
			{error && <p className="text-sm text-destructive">{error}</p>}

			<div className="grid gap-4 sm:grid-cols-3">
				<SummaryCard label="Faturamento no mês" value={formatCents(current.revenue)} />
				<SummaryCard label="Vendas finalizadas no mês" value={String(current.count)} />
				<SummaryCard label="Ticket médio no mês" value={formatCents(avgTicket)} />
			</div>

			{(Object.keys(bySourceThisMonth).length > 0 || months.length > 0) && (
				<div className="grid gap-4 lg:grid-cols-2">
					<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
						<h2 className="mb-3 text-sm font-medium">Últimos meses</h2>
						<ul className="space-y-1.5 text-sm">
							{months.length === 0 && (
								<li className="text-muted-foreground">Sem vendas finalizadas no período.</li>
							)}
							{months.map((m) => (
								<li key={m.month} className="flex items-center justify-between">
									<span className="text-muted-foreground">{formatMonth(m.month)}</span>
									<span>
										{m.count} {m.count === 1 ? "venda" : "vendas"} ·{" "}
										<strong>{formatCents(m.revenue)}</strong>
									</span>
								</li>
							))}
						</ul>
					</div>

					<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
						<h2 className="mb-3 text-sm font-medium">Faturamento por origem (mês atual)</h2>
						<ul className="space-y-1.5 text-sm">
							{Object.keys(bySourceThisMonth).length === 0 && (
								<li className="text-muted-foreground">Sem vendas finalizadas neste mês.</li>
							)}
							{Object.entries(bySourceThisMonth).map(([src, revenue]) => (
								<li key={src} className="flex items-center justify-between">
									<span className="text-muted-foreground">{sourceLabel(src)}</span>
									<strong>{formatCents(revenue)}</strong>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}

			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">Status:</span>
				<Select value={status} onValueChange={setStatus}>
					<SelectTrigger className="w-44">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALL}>Todas</SelectItem>
						<SelectItem value="open">Abertas</SelectItem>
						<SelectItem value="finalized">Finalizadas</SelectItem>
						<SelectItem value="cancelled">Canceladas</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-20">Nº</TableHead>
						<TableHead className="w-28">Data</TableHead>
						{isAdmin && <TableHead>Cliente</TableHead>}
						<TableHead>Lead</TableHead>
						<TableHead className="w-28">Origem</TableHead>
						<TableHead className="w-16">Itens</TableHead>
						<TableHead className="w-32">Total</TableHead>
						<TableHead className="w-32">Pagamento</TableHead>
						<TableHead className="w-28">Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableEmpty colSpan={colSpan}>Carregando…</TableEmpty>
					) : sales.length === 0 ? (
						<TableEmpty colSpan={colSpan}>Nenhuma venda encontrada.</TableEmpty>
					) : (
						sales.map((s) => (
							<TableRow
								key={s.id}
								onClick={() => router.push(`/vendas/${s.id}`)}
								className="cursor-pointer"
							>
								<TableCell className="font-medium">#{s.number}</TableCell>
								<TableCell>{formatDate(s.created_at)}</TableCell>
								{isAdmin && <TableCell>{s.client_name ?? "—"}</TableCell>}
								<TableCell>{s.lead_name ?? "—"}</TableCell>
								<TableCell>{sourceLabel(s.source)}</TableCell>
								<TableCell>{s.items_count ?? 0}</TableCell>
								<TableCell>{formatCents(s.total_cents)}</TableCell>
								<TableCell className="capitalize">
									{s.payment_method ? s.payment_method.replace("_", " ") : "—"}
								</TableCell>
								<TableCell>
									<SaleStatusBadge status={s.status} />
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}

function SummaryCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
		</div>
	);
}
