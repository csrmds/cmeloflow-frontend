import * as React from "react";
import type { PaymentMethod, SaleStatus } from "@/lib/types";

export const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
	{ value: "pix", label: "Pix" },
	{ value: "dinheiro", label: "Dinheiro" },
	{ value: "cartao_credito", label: "Cartão de crédito" },
	{ value: "cartao_debito", label: "Cartão de débito" },
	{ value: "boleto", label: "Boleto" },
	{ value: "transferencia", label: "Transferência" },
	{ value: "outro", label: "Outro" },
];

export const SOURCE_OPTIONS: { value: string; label: string }[] = [
	{ value: "manual", label: "Manual" },
	{ value: "whatsapp", label: "WhatsApp" },
	{ value: "instagram", label: "Instagram" },
];

export function paymentLabel(value: string | null | undefined) {
	if (!value) return "—";
	return PAYMENT_OPTIONS.find((p) => p.value === value)?.label ?? value;
}

export function sourceLabel(value: string | null | undefined) {
	if (!value) return "—";
	return SOURCE_OPTIONS.find((s) => s.value === value)?.label ?? value;
}

const STATUS_STYLES: Record<SaleStatus, { label: string; className: string }> = {
	open: {
		label: "Aberta",
		className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	},
	finalized: {
		label: "Finalizada",
		className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	},
	cancelled: {
		label: "Cancelada",
		className: "bg-muted text-muted-foreground",
	},
};

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
	const s = STATUS_STYLES[status] ?? STATUS_STYLES.open;
	return (
		<span className={`rounded-md px-2 py-0.5 text-xs font-medium ${s.className}`}>
			{s.label}
		</span>
	);
}
