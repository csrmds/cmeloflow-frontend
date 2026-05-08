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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { api, extractErrorMessage } from "@/lib/api";
import type { Client } from "@/lib/types";
//import { Select } from "radix-ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const schema = z.object({
	name: z.string().min(3, "Nome obrigatório"),
	email: z.string().email("E-mail inválido").or(z.literal("")).optional(),
	instagram_id: z.string().optional(),
	instagram_username: z.string().optional(),
	instagram_name: z.string().optional(),
	whatsapp_number: z.string().optional(),
	status: z.string().optional(),
	about: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ClientFormProps {
	client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
	const router = useRouter();
	const isEdit = Boolean(client);
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
			name: client?.name ?? "",
			email: client?.email ?? "",
			instagram_id: client?.instagram_id ?? "",
			instagram_username: client?.instagram_username ?? "",
			instagram_name: client?.instagram_name ?? "",
			whatsapp_number: client?.whatsapp_number ?? "",
			status: client?.status ?? "",
			about: client?.about ?? "",
		},
	});

	const status = watch("status");

	const onSubmit = async (values: FormValues) => {
		setServerError(null);
		try {
			const payload = { ...values, instagram_photo: client?.instagram_photo ?? null };
			if (isEdit && client) {
				await api.put(`/clients/${client.id}`, payload);
			} else {
				const res = await api.post<Client>(`/clients`, payload);
				router.push(`/admin/clientes/${res.data.id}`);
				return;
			}
			router.push("/admin/clientes");
			router.refresh();
		} catch (err) {
			setServerError(extractErrorMessage(err, "Falha ao salvar."));
		}
	};

	const onDelete = async () => {
		if (!client) return;
		try {
			await api.delete(`/clients/${client.id}`);
			router.push("/admin/clientes");
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

					<div className="space-y-1.5">
						<Label htmlFor="email">E-mail</Label>
						<Input id="email" type="email" {...register("email")} />
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="whatsapp_number">WhatsApp</Label>
						<Input id="whatsapp_number" {...register("whatsapp_number")} />
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="instagram_username">Instagram Username</Label>
						<Input id="instagram_username" readOnly {...register("instagram_username")} />
					</div>

					{/* <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Input id="status" {...register("status")} />
          </div> */}
					<div className="space-y-1.5">
						<Label>Status</Label>
						<Select 
							value={status}
							onValueChange={(v) => setValue("status", v as "ativo" | "inativo")}
							>
							<SelectTrigger> <SelectValue/> </SelectTrigger>
							<SelectContent>
								<SelectItem value="inativo">Inativo</SelectItem>
								<SelectItem value="ativo">Ativo</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="about">Sobre</Label>
						<Textarea id="about" rows={5} {...register("about")} />
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
						<Button type="button" variant="destructive" onClick={() => setConfirmOpen(true)}>
							<Trash2 className="h-4 w-4" />
							Excluir
						</Button>
					)}
				</div>
			</form>

			<ConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Excluir cliente?"
				description="Todos os telefones e dados vinculados serão removidos."
				confirmLabel="Excluir"
				destructive
				onConfirm={onDelete}
			/>
		</>
	);
}
