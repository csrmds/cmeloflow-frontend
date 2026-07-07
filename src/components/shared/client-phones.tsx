"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader as Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogContent,
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
import {
	Table,
	TableBody,
	TableCell,
	TableEmpty,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { api, extractErrorMessage } from "@/lib/api";
import type { ClientPhone, ApiResponse } from "@/lib/types";



const schema = z.object({
	phone_number: z.string().min(1, "Número obrigatório"),
	label: z.string().optional(),
	role: z.enum(["ai", "human"]),
	is_primary: z.boolean(),
	active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface ClientPhonesProps {
	clientId: number;
}

export function ClientPhones({ clientId }: ClientPhonesProps) {
	const [phones, setPhones] = React.useState<ClientPhone[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [open, setOpen] = React.useState(false);
	const [editPhone, setEditPhone] = React.useState<ClientPhone | null>(null);
	const [deleteId, setDeleteId] = React.useState<number | null>(null);

	const refresh = React.useCallback(async () => {
		setLoading(true);
		try {
			const res = await api.get<ApiResponse<ClientPhone[]>>(`/clients/${clientId}/phones`);
			setPhones(res.data.data);
		} catch (err) {
			setError(extractErrorMessage(err, "Erro ao carregar telefones."));
		} finally {
			setLoading(false);
		}
	}, [clientId]);

	React.useEffect(() => {
		refresh();
	}, [refresh]);

	const onDelete = async () => {
		if (!deleteId) return;
		try {
			await api.delete(`/clients/${clientId}/phones/${deleteId}`);
			setDeleteId(null);
			await refresh();
		} catch (err) {
			setError(extractErrorMessage(err, "Falha ao excluir telefone."));
		}
	};

	return (
		<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">Telefones</h2>
					<p className="text-sm text-muted-foreground">
						Gerencie os números de WhatsApp deste cliente.
					</p>
				</div>
				<Button onClick={() => setOpen(true)}>
					<Plus className="h-4 w-4" />
					Adicionar Telefone
				</Button>
			</div>

			{error && <p className="mb-3 text-sm text-destructive">{error}</p>}

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Número</TableHead>
						<TableHead>Label</TableHead>
						<TableHead className="w-24">Role</TableHead>
						<TableHead className="w-24">Principal</TableHead>
						<TableHead className="w-24">Ativo</TableHead>
						<TableHead className="w-24" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableEmpty colSpan={6}>Carregando…</TableEmpty>
					) : phones.length === 0 ? (
						<TableEmpty colSpan={6}>Nenhum telefone cadastrado.</TableEmpty>
					) : (
						phones.map((p) => (
							<TableRow key={p.id}>
								<TableCell className="font-medium">{p.phone_number}</TableCell>
								<TableCell className="text-muted-foreground">
									{p.label || "—"}
								</TableCell>
								<TableCell>
									<span className="rounded-md bg-secondary px-2 py-0.5 text-xs">
										{p.role === "ai" ? "IA" : "Humano"}
									</span>
								</TableCell>
								<TableCell>{Number(p.is_primary) ? "Sim" : "Não"}</TableCell>
								<TableCell>{Number(p.active) ? "Sim" : "Não"}</TableCell>
								<TableCell>
									<Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(p.id)} aria-label="Excluir" >
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
									<Button variant="ghost" size="icon-sm" onClick={() => setEditPhone(p)} aria-label="Editar" >
										<Pencil className="h-4 w-4" />
									</Button>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			<PhoneFormDialog
				open={open || editPhone !== null}
				onOpenChange={(o) => {
					if (!o) {
						setOpen(false);
						setEditPhone(null);
					}
				}}
				clientId={clientId}
				phone={editPhone}
				onSaved={refresh}
			/>

			<ConfirmDialog
				open={deleteId !== null}
				onOpenChange={(o) => !o && setDeleteId(null)}
				title="Excluir telefone?"
				description="Esta ação não poderá ser desfeita."
				destructive
				confirmLabel="Excluir"
				onConfirm={onDelete}
			/>
		</div>
	);
}

interface PhoneFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	clientId: number;
	phone?: ClientPhone | null;
	onSaved: () => Promise<void> | void;
}

function PhoneFormDialog({
	open,
	onOpenChange,
	clientId,
	phone,
	onSaved,
}: PhoneFormDialogProps) {
	const isEdit = Boolean(phone);
	const [serverError, setServerError] = React.useState<string | null>(null);
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			phone_number: "",
			label: "",
			role: "human",
			is_primary: false,
			active: true,
		},
	});

	React.useEffect(() => {
		if (!open) return;
		reset({
			phone_number: phone?.phone_number ?? "",
			label: phone?.label ?? "",
			role: (phone?.role as "ai" | "human") ?? "human",
			is_primary: Boolean(Number(phone?.is_primary ?? 0)),
			active: phone ? Boolean(Number(phone.active)) : true,
		});
	}, [open, phone, reset]);

	const role = watch("role");
	const isPrimary = watch("is_primary");
	const active = watch("active");

	const onSubmit = async (values: FormValues) => {
		setServerError(null);
		const payload = {
			...values,
			is_primary: values.is_primary ? 1 : 0,
			active: values.active ? 1 : 0,
		};
		try {
			if (isEdit && phone) {
				await api.put(`/clients/${clientId}/phones/${phone.id}`, payload);
			} else {
				await api.post(`/clients/${clientId}/phones`, payload);
			}
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			setServerError(
				extractErrorMessage(err, isEdit ? "Falha ao atualizar telefone." : "Falha ao salvar telefone.")
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isEdit ? "Editar telefone" : "Adicionar telefone"}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="phone_number">Número</Label>
						<Input
							id="phone_number"
							placeholder="5527999999999"
							{...register("phone_number")}
						/>
						{errors.phone_number && (
							<p className="text-xs text-destructive">
								{errors.phone_number.message}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="label">Label</Label>
						<Input
							id="label"
							placeholder="Ex: Vendas, IA, Gerente"
							{...register("label")}
						/>
					</div>

					<div className="space-y-1.5">
						<Label>Role</Label>
						<Select
							value={role}
							onValueChange={(v) => setValue("role", v as "ai" | "human")}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ai">IA</SelectItem>
								<SelectItem value="human">Humano</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center gap-3">
						<Switch
							id="is_primary"
							checked={isPrimary}
							onCheckedChange={(v) => setValue("is_primary", v)}
						/>
						<Label htmlFor="is_primary" className="cursor-pointer">
							Principal
						</Label>
					</div>

					<div className="flex items-center gap-3">
						<Switch
							id="active"
							checked={active}
							onCheckedChange={(v) => setValue("active", v)}
						/>
						<Label htmlFor="active" className="cursor-pointer">
							Ativo
						</Label>
					</div>

					{serverError && (
						<p className="text-sm text-destructive">{serverError}</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
							Salvar
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
