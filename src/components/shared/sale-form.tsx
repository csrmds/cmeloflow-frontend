"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader as Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api, extractErrorMessage } from "@/lib/api";
import { centsToReais, formatCents, reaisToCents } from "@/lib/utils";
import type {
	ApiResponse,
	ClientLeadView,
	PaymentMethod,
	Product,
	SaleDetail,
} from "@/lib/types";
import { CancelSaleDialog, FinalizeSaleDialog } from "./sale-dialogs";
import { SOURCE_OPTIONS } from "./sale-status";

const NONE = "none";
const CUSTOM = "custom";

interface ItemState {
	key: number;
	productId: string; // id do produto ou CUSTOM (item avulso)
	description: string;
	quantity: string;
	unitPrice: string; // em reais
	discount: string; // em reais
}

interface SaleFormProps {
	/** Venda ABERTA a ser editada. Sem ela, o formulário cria uma venda nova. */
	sale?: SaleDetail;
	redirectAfter?: string;
}

let itemKeyCounter = 0;
const nextKey = () => ++itemKeyCounter;

function emptyItem(): ItemState {
	return {
		key: nextKey(),
		productId: CUSTOM,
		description: "",
		quantity: "1",
		unitPrice: "",
		discount: "",
	};
}

function lineTotalCents(item: ItemState): number {
	const qty = Number(item.quantity);
	const price = reaisToCents(item.unitPrice);
	const discount = item.discount.trim() === "" ? 0 : reaisToCents(item.discount);
	if (!Number.isInteger(qty) || qty < 1 || price === null || discount === null) return 0;
	return Math.max(qty * price - discount, 0);
}

export function SaleForm({ sale, redirectAfter = "/vendas" }: SaleFormProps) {
	const router = useRouter();
	const isEdit = Boolean(sale);

	const [products, setProducts] = React.useState<Product[]>([]);
	const [leads, setLeads] = React.useState<ClientLeadView[]>([]);

	const [leadId, setLeadId] = React.useState<string>(sale?.lead_id ? String(sale.lead_id) : NONE);
	const [source, setSource] = React.useState<string>(sale?.source ?? "manual");
	const [notes, setNotes] = React.useState<string>(sale?.notes ?? "");
	const [discount, setDiscount] = React.useState<string>(
		sale && Number(sale.discount_cents) > 0 ? centsToReais(Number(sale.discount_cents)) : ""
	);
	const [items, setItems] = React.useState<ItemState[]>(() =>
		sale && sale.items.length > 0
			? sale.items.map((i) => ({
				key: nextKey(),
				productId: i.product_id ? String(i.product_id) : CUSTOM,
				description: i.description,
				quantity: String(i.quantity),
				unitPrice: centsToReais(Number(i.unit_price_cents)),
				discount: Number(i.discount_cents) > 0 ? centsToReais(Number(i.discount_cents)) : "",
			}))
			: [emptyItem()]
	);

	const [serverError, setServerError] = React.useState<string | null>(null);
	const [saving, setSaving] = React.useState(false);
	const [finalizeOpen, setFinalizeOpen] = React.useState(false);
	const [cancelOpen, setCancelOpen] = React.useState(false);

	// Carrega produtos e leads para os selects
	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const [prodRes, leadRes] = await Promise.all([
					api.get<ApiResponse<Product[]>>("/products"),
					api.get<ApiResponse<ClientLeadView[]>>("/leads"),
				]);
				if (cancelled) return;
				// Admin recebe dados de todos os clientes: filtra pelo cliente da venda
				const sameClient = <T extends { client_id: number }>(row: T) =>
					!sale || row.client_id === sale.client_id;
				setProducts(prodRes.data.data.filter((p) => Number(p.active) && sameClient(p)));
				setLeads(leadRes.data.data.filter(sameClient));
			} catch (err) {
				if (!cancelled) setServerError(extractErrorMessage(err, "Erro ao carregar produtos e leads."));
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [sale]);

	const itemsTotal = items.reduce((sum, i) => sum + lineTotalCents(i), 0);
	const discountCents = discount.trim() === "" ? 0 : reaisToCents(discount) ?? 0;
	const total = itemsTotal - discountCents;

	const updateItem = (key: number, patch: Partial<ItemState>) =>
		setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));

	const removeItem = (key: number) =>
		setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.key !== key) : prev));

	const onSelectProduct = (key: number, value: string) => {
		if (value === CUSTOM) {
			updateItem(key, { productId: CUSTOM });
			return;
		}
		const product = products.find((p) => String(p.id) === value);
		if (!product) return;
		updateItem(key, {
			productId: value,
			description: product.name,
			unitPrice: centsToReais(Math.round(Number(product.price ?? 0) * 100)),
		});
	};

	/** Valida e monta o payload. Retorna null (e preenche o erro) se inválido. */
	const buildPayload = () => {
		const payloadItems = [];

		for (let idx = 0; idx < items.length; idx++) {
			const i = items[idx];
			const n = idx + 1;
			const qty = Number(i.quantity);
			const price = reaisToCents(i.unitPrice);
			const itemDiscount = i.discount.trim() === "" ? 0 : reaisToCents(i.discount);

			if (!i.description.trim()) {
				setServerError(`Item ${n}: informe a descrição.`);
				return null;
			}
			if (!Number.isInteger(qty) || qty < 1) {
				setServerError(`Item ${n}: quantidade inválida.`);
				return null;
			}
			if (price === null) {
				setServerError(`Item ${n}: preço inválido.`);
				return null;
			}
			if (itemDiscount === null || itemDiscount > qty * price) {
				setServerError(`Item ${n}: desconto inválido.`);
				return null;
			}

			payloadItems.push({
				product_id: i.productId === CUSTOM ? null : Number(i.productId),
				description: i.description.trim(),
				quantity: qty,
				unit_price_cents: price,
				discount_cents: itemDiscount,
			});
		}

		const saleDiscount = discount.trim() === "" ? 0 : reaisToCents(discount);
		if (saleDiscount === null) {
			setServerError("Desconto da venda inválido.");
			return null;
		}
		if (saleDiscount > itemsTotal) {
			setServerError("O desconto da venda é maior que o total dos itens.");
			return null;
		}

		return {
			lead_id: leadId === NONE ? null : Number(leadId),
			source,
			notes: notes.trim() || null,
			discount_cents: saleDiscount,
			items: payloadItems,
		};
	};

	const saveDraft = async () => {
		setServerError(null);
		const payload = buildPayload();
		if (!payload) return;

		setSaving(true);
		try {
			if (isEdit && sale) {
				await api.put(`/sales/${sale.id}`, payload);
			} else {
				await api.post(`/sales`, payload);
			}
			router.push(redirectAfter);
			router.refresh();
		} catch (err) {
			setServerError(extractErrorMessage(err, "Falha ao salvar a venda."));
		} finally {
			setSaving(false);
		}
	};

	const openFinalize = () => {
		setServerError(null);
		if (!buildPayload()) return;
		setFinalizeOpen(true);
	};

	const finalize = async (paymentMethod: PaymentMethod) => {
		const payload = buildPayload();
		if (!payload) throw new Error("Corrija os dados da venda antes de finalizar.");

		if (isEdit && sale) {
			await api.put(`/sales/${sale.id}`, payload);
			await api.put(`/sales/${sale.id}/finalize`, { payment_method: paymentMethod });
		} else {
			await api.post(`/sales`, { ...payload, finalize: true, payment_method: paymentMethod });
		}
		router.push(redirectAfter);
		router.refresh();
	};

	const cancelSale = async (reason: string) => {
		if (!sale) return;
		await api.put(`/sales/${sale.id}/cancel`, { reason: reason || null });
		router.push(redirectAfter);
		router.refresh();
	};

	return (
		<>
			<div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label>Lead (opcional)</Label>
						<Select value={leadId} onValueChange={setLeadId}>
							<SelectTrigger>
								<SelectValue placeholder="Selecione" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={NONE}>Sem lead</SelectItem>
								{leads.map((l) => (
									<SelectItem key={l.lead_id} value={String(l.lead_id)}>
										{l.lead_name || "Sem nome"}
										{l.lead_whatsapp_number ? ` — ${l.lead_whatsapp_number}` : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<Label>Origem</Label>
						<Select value={source} onValueChange={setSource}>
							<SelectTrigger>
								<SelectValue placeholder="Selecione" />
							</SelectTrigger>
							<SelectContent>
								{SOURCE_OPTIONS.map((s) => (
									<SelectItem key={s.value} value={s.value}>
										{s.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label className="text-base">Itens</Label>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setItems((prev) => [...prev, emptyItem()])}
						>
							<Plus className="h-4 w-4" />
							Adicionar item
						</Button>
					</div>

					{items.map((item, idx) => (
						<div key={item.key} className="space-y-3 rounded-lg border border-border p-4">
							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label>Produto / serviço</Label>
									<Select
										value={item.productId}
										onValueChange={(v) => onSelectProduct(item.key, v)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={CUSTOM}>Item avulso</SelectItem>
											{products.map((p) => (
												<SelectItem key={p.id} value={String(p.id)}>
													{p.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor={`desc-${item.key}`}>Descrição</Label>
									<Input
										id={`desc-${item.key}`}
										maxLength={255}
										value={item.description}
										onChange={(e) => updateItem(item.key, { description: e.target.value })}
									/>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-5 sm:items-end">
								<div className="space-y-1.5">
									<Label htmlFor={`qty-${item.key}`}>Qtd.</Label>
									<Input
										id={`qty-${item.key}`}
										type="number"
										min={1}
										step={1}
										value={item.quantity}
										onChange={(e) => updateItem(item.key, { quantity: e.target.value })}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor={`price-${item.key}`}>Preço unit. (R$)</Label>
									<Input
										id={`price-${item.key}`}
										inputMode="decimal"
										placeholder="0,00"
										value={item.unitPrice}
										onChange={(e) => updateItem(item.key, { unitPrice: e.target.value })}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor={`disc-${item.key}`}>Desconto (R$)</Label>
									<Input
										id={`disc-${item.key}`}
										inputMode="decimal"
										placeholder="0,00"
										value={item.discount}
										onChange={(e) => updateItem(item.key, { discount: e.target.value })}
									/>
								</div>
								<div className="space-y-1.5">
									<Label>Total do item</Label>
									<p className="flex h-9 items-center text-sm font-medium">
										{formatCents(lineTotalCents(item))}
									</p>
								</div>
								<div className="flex sm:justify-end">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeItem(item.key)}
										disabled={items.length === 1}
										aria-label={`Remover item ${idx + 1}`}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="notes">Observações</Label>
						<Textarea
							id="notes"
							rows={3}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="sale-discount">Desconto da venda (R$)</Label>
						<Input
							id="sale-discount"
							inputMode="decimal"
							placeholder="0,00"
							value={discount}
							onChange={(e) => setDiscount(e.target.value)}
						/>
					</div>

					<div className="space-y-1 text-sm sm:text-right">
						<p className="text-muted-foreground">
							Subtotal: <span className="text-foreground">{formatCents(itemsTotal)}</span>
						</p>
						<p className="text-lg font-semibold">Total: {formatCents(Math.max(total, 0))}</p>
					</div>
				</div>

				{serverError && <p className="text-sm text-destructive">{serverError}</p>}

				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex flex-wrap gap-2">
						<Button type="button" onClick={openFinalize} disabled={saving}>
							Finalizar venda
						</Button>
						<Button type="button" variant="secondary" onClick={saveDraft} disabled={saving}>
							{saving && <Loader2 className="h-4 w-4 animate-spin" />}
							Salvar rascunho
						</Button>
						<Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
							Voltar
						</Button>
					</div>
					{isEdit && (
						<Button type="button" variant="destructive" onClick={() => setCancelOpen(true)} disabled={saving}>
							<Trash2 className="h-4 w-4" />
							Cancelar venda
						</Button>
					)}
				</div>
			</div>

			<FinalizeSaleDialog
				open={finalizeOpen}
				onOpenChange={setFinalizeOpen}
				totalCents={Math.max(total, 0)}
				onConfirm={finalize}
			/>

			{isEdit && (
				<CancelSaleDialog open={cancelOpen} onOpenChange={setCancelOpen} onConfirm={cancelSale} />
			)}
		</>
	);
}
