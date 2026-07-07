"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { api, extractErrorMessage } from "@/lib/api";
import { useUserStore } from "@/lib/stores/user-store";
import { ClientPhones } from "@/components/shared/client-phones";
import type { Client, ApiResponse } from "@/lib/types";

const schema = z.object({
	name: z.string().optional(),
	email: z.string().email("E-mail inválido").or(z.literal("")).optional(),
	instagram_username: z.string().optional(),
	about: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PerfilPage() {
	const clientId = useUserStore((s) => s.payload?.client_id);
	const [client, setClient] = React.useState<Client | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [success, setSuccess] = React.useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<FormValues>({ resolver: zodResolver(schema) });

	React.useEffect(() => {
		if (!clientId) return;
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const res = await api.get<ApiResponse<Client>>(`/clients/${clientId}`);
				if (!cancelled) {
					setClient(res.data.data);
					reset({
						name: res.data.data.name ?? "",
						email: res.data.data.email ?? "",
						instagram_username: res.data.data.instagram_username ?? "",
						about: res.data.data.about ?? "",
					});
				}
			} catch (err) {
				if (!cancelled) setError(extractErrorMessage(err, "Erro ao carregar perfil."));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [clientId, reset]);

	const onSubmit = async (values: FormValues) => {
		if (!clientId) return;
		setError(null);
		setSuccess(null);
		try {
			const res = await api.put<Client>(`/clients/${clientId}`, {
				...values,
				instagram_id: client?.instagram_id ?? null,
				instagram_photo: client?.instagram_photo ?? null,
				status: client?.status ?? null,
			});
			setClient(res.data);
			setSuccess("Alterações salvas com sucesso.");
		} catch (err) {
			setError(extractErrorMessage(err, "Falha ao salvar."));
		}
	};

	return (
		<div className="max-w-4xl space-y-6">
			<PageHeader title="Meu Perfil" description="Atualize as informações da sua empresa." />

			{loading ? (
				<p className="text-sm text-muted-foreground">Carregando…</p>
			) : (
				<>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-1.5 sm:col-span-2">
								<Label htmlFor="name">Nome</Label>
								<Input id="name" {...register("name")} />
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="email">E-mail</Label>
								<Input id="email" type="email" {...register("email")} />
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="instagram_username">Instagram Username</Label>
								<Input id="instagram_username" {...register("instagram_username")}/>
							</div>

							<div className="space-y-1.5 sm:col-span-2">
								<Label htmlFor="about">Sobre a empresa</Label>
								<Textarea id="about" rows={6} {...register("about")} />
							</div>
						</div>

						{error && <p className="text-sm text-destructive">{error}</p>}
						{success && <p className="text-sm text-emerald-600">{success}</p>}

						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
							Salvar alterações
						</Button>
					</form>
					
					{client && <ClientPhones clientId={client.id} />}
				</>
			)}
		</div>
	);
}
