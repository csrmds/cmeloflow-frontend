"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatCents } from "@/lib/utils";
import type { SaleDetail as SaleDetailType } from "@/lib/types";
import { CancelSaleDialog } from "./sale-dialogs";
import { SaleStatusBadge, paymentLabel, sourceLabel } from "./sale-status";

function formatDateTime(value: string | null) {
	if (!value) return "—";
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
}

interface SaleDetailProps {
	sale: SaleDetailType;
	isAdmin?: boolean;
	/** Chamado após uma alteração (ex.: cancelamento) para recarregar a venda. */
	onChanged: () => void;
}

/** Visão somente leitura de vendas finalizadas ou canceladas. */
export function SaleDetail({ sale, isAdmin = false, onChanged }: SaleDetailProps) {
	const router = useRouter();
	const [cancelOpen, setCancelOpen] = React.useState(false);

	const itemsTotal = sale.items.reduce((sum, i) => sum + Number(i.total_cents), 0);

	const cancelSale = async (reason: string) => {
		await api.put(`/sales/${sale.id}/cancel`, { reason: reason || null });
		onChanged();
	};

	return (
		<>
			<div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-3">
						<h2 className="text-lg font-semibold">Venda #{sale.number}</h2>
						<SaleStatusBadge status={sale.status} />
					</div>
					{sale.status === "finalized" && (
						<Button variant="destructive" onClick={() => setCancelOpen(true)}>
							Cancelar venda
						</Button>
					)}
				</div>

				<dl className="grid gap-4 text-sm sm:grid-cols-2">
					{isAdmin && <Info label="Cliente" value={sale.client_name ?? "—"} />}
					<Info label="Lead" value={sale.lead_name ?? "—"} />
					<Info label="Origem" value={sourceLabel(sale.source)} />
					<Info label="Forma de pagamento" value={paymentLabel(sale.payment_method)} />
					<Info label="Criada em" value={formatDateTime(sale.created_at)} />
					{sale.finalized_at && <Info label="Finalizada em" value={formatDateTime(sale.finalized_at)} />}
					{sale.cancelled_at && <Info label="Cancelada em" value={formatDateTime(sale.cancelled_at)} />}
					{sale.cancel_reason && <Info label="Motivo do cancelamento" value={sale.cancel_reason} />}
					{sale.notes && (
						<div className="sm:col-span-2">
							<Info label="Observações" value={sale.notes} />
						</div>
					)}
				</dl>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Descrição</TableHead>
							<TableHead className="w-16">Qtd.</TableHead>
							<TableHead className="w-32">Preço unit.</TableHead>
							<TableHead className="w-32">Desconto</TableHead>
							<TableHead className="w-32">Total</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sale.items.map((i) => (
							<TableRow key={i.id}>
								<TableCell className="font-medium">{i.description}</TableCell>
								<TableCell>{i.quantity}</TableCell>
								<TableCell>{formatCents(i.unit_price_cents)}</TableCell>
								<TableCell>{formatCents(i.discount_cents)}</TableCell>
								<TableCell>{formatCents(i.total_cents)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				<div className="space-y-1 text-sm sm:text-right">
					<p className="text-muted-foreground">
						Subtotal: <span className="text-foreground">{formatCents(itemsTotal)}</span>
					</p>
					{Number(sale.discount_cents) > 0 && (
						<p className="text-muted-foreground">
							Desconto: <span className="text-foreground">- {formatCents(sale.discount_cents)}</span>
						</p>
					)}
					<p className="text-lg font-semibold">Total: {formatCents(sale.total_cents)}</p>
				</div>

				<div>
					<Button variant="outline" onClick={() => router.back()}>
						Voltar
					</Button>
				</div>
			</div>

			<CancelSaleDialog
				open={cancelOpen}
				onOpenChange={setCancelOpen}
				finalized
				onConfirm={cancelSale}
			/>
		</>
	);
}

function Info({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="font-medium">{value}</dd>
		</div>
	);
}
