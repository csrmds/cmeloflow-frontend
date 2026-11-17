"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { extractErrorMessage } from "@/lib/api";
import { formatCents } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";
import { PAYMENT_OPTIONS } from "./sale-status";

interface FinalizeSaleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	totalCents: number;
	onConfirm: (paymentMethod: PaymentMethod) => Promise<void>;
}

export function FinalizeSaleDialog({
	open,
	onOpenChange,
	totalCents,
	onConfirm,
}: FinalizeSaleDialogProps) {
	const [method, setMethod] = React.useState<PaymentMethod>("pix");
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (open) setError(null);
	}, [open]);

	const handleConfirm = async () => {
		setLoading(true);
		setError(null);
		try {
			await onConfirm(method);
			onOpenChange(false);
		} catch (err) {
			setError(extractErrorMessage(err, "Falha ao finalizar a venda."));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Finalizar venda</DialogTitle>
					<DialogDescription>
						Total: <strong>{formatCents(totalCents)}</strong>. Informe como o
						cliente pagou.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-1.5">
					<Label>Forma de pagamento</Label>
					<Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
						<SelectTrigger>
							<SelectValue placeholder="Selecione" />
						</SelectTrigger>
						<SelectContent>
							{PAYMENT_OPTIONS.map((p) => (
								<SelectItem key={p.value} value={p.value}>
									{p.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{error && <p className="text-sm text-destructive">{error}</p>}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
						Voltar
					</Button>
					<Button onClick={handleConfirm} disabled={loading}>
						{loading ? "Processando…" : "Finalizar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface CancelSaleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	finalized?: boolean;
	onConfirm: (reason: string) => Promise<void>;
}

export function CancelSaleDialog({
	open,
	onOpenChange,
	finalized = false,
	onConfirm,
}: CancelSaleDialogProps) {
	const [reason, setReason] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (open) {
			setReason("");
			setError(null);
		}
	}, [open]);

	const handleConfirm = async () => {
		setLoading(true);
		setError(null);
		try {
			await onConfirm(reason.trim());
			onOpenChange(false);
		} catch (err) {
			setError(extractErrorMessage(err, "Falha ao cancelar a venda."));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Cancelar venda?</DialogTitle>
					<DialogDescription>
						{finalized
							? "A venda finalizada deixará de contar no faturamento. A venda não é apagada, apenas marcada como cancelada."
							: "A venda não é apagada, apenas marcada como cancelada."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-1.5">
					<Label htmlFor="cancel-reason">Motivo (opcional)</Label>
					<Textarea
						id="cancel-reason"
						rows={3}
						maxLength={255}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
				</div>

				{error && <p className="text-sm text-destructive">{error}</p>}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
						Voltar
					</Button>
					<Button variant="destructive" onClick={handleConfirm} disabled={loading}>
						{loading ? "Processando…" : "Cancelar venda"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
