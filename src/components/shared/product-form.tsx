"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader as Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { api, extractErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";

const schema = z.object({
	name: z.string().min(1, "Nome obrigatório"),
	description: z.string().optional(),
	price: z
		.string()
		.min(1, "Preço obrigatório")
		.refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
			message: "Preço inválido",
		}),
	type: z.enum(["produto", "servico"]),
	active: z.boolean(),
	keywords: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormProps {
	product?: Product;
	redirectAfter?: string;
}

export function ProductForm({
	product,
	redirectAfter = "/produtos",
}: ProductFormProps) {
	const router = useRouter();
	const isEdit = Boolean(product);
	const [serverError, setServerError] = React.useState<string | null>(null);
	const [confirmOpen, setConfirmOpen] = React.useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: product?.name ?? "",
			description: product?.description ?? "",
			price: product?.price != null ? String(product.price) : "0",
			type: ((product?.type as "produto" | "servico") ?? "produto"),
			active: product ? Boolean(Number(product.active)) : true,
			keywords: product?.keywords ?? "",
		},
	});

	React.useEffect(() => {
		//console.log("UseEffect product: ", product)
	})

	const type = watch("type");
	const active = watch("active");

	const onSubmit = async (values: FormValues) => {
		setServerError(null);
		const payload = { ...values, price: Number(values.price)};
		try {
			if (isEdit && product) {
				await api.put(`/products/${product.id}`, payload);
			} else {
				await api.post(`/products`, payload);
			}
			router.push(redirectAfter);
			router.refresh();
		} catch (err) {
			setServerError(extractErrorMessage(err, "Falha ao salvar."));
		}
	};

	const onDelete = async () => {
		if (!product) return;
		try {
			await api.delete(`/products/${product.id}`);
			router.push(redirectAfter);
			router.refresh();
		} catch (err) {
			setServerError(extractErrorMessage(err, "Falha ao excluir."));
		}
	};

	return (
		<>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
			>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="name">Nome</Label>
						<Input id="name" {...register("name")} />
						{errors.name && (
							<p className="text-xs text-destructive">{errors.name.message}</p>
						)}
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="description">Descrição</Label>
						<Textarea id="description" rows={5} {...register("description")} />
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="price">Preço</Label>
						<Input id="price" type="number" step="0.01" {...register("price")} />
						{errors.price && (
							<p className="text-xs text-destructive">{errors.price.message}</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label>Tipo</Label>
						<Select value={type} onValueChange={(v) => setValue("type", v as "produto" | "servico")} >
							<SelectTrigger>
								<SelectValue placeholder="Selecione" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="produto">Produto</SelectItem>
								<SelectItem value="servico">Serviço</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="keywords">Palavras-chave</Label>
						<Input id="keywords" placeholder="ex: automação, whatsapp, atendimento" {...register("keywords")} />
						<p className="text-xs text-muted-foreground">
							Separe as palavras por vírgula.
						</p>
					</div>

					<div className="flex items-center gap-3 sm:col-span-2">
						<Switch id="active" checked={active} onCheckedChange={(v) => setValue("active", v)} />
						<Label htmlFor="active" className="cursor-pointer"> Ativo </Label>
					</div>
				</div>

				{serverError && (
					<p className="text-sm text-destructive">{serverError}</p>
				)}

				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex gap-2">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
							Salvar
						</Button>
						<Button type="button" variant="outline" onClick={() => router.back()} >
							Cancelar
						</Button>
					</div>
					{isEdit && (
						<Button type="button" variant="destructive" onClick={() => setConfirmOpen(true)} >
							<Trash2 className="h-4 w-4" />
							Excluir
						</Button>
					)}
				</div>
			</form>

			<ConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Excluir produto?"
				description="Esta ação é permanente e não poderá ser desfeita."
				confirmLabel="Excluir"
				destructive
				onConfirm={onDelete}
			/>
		</>
	);
}
