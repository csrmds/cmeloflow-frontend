"use client";

import * as React from "react";
import { Loader as Loader2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { api, extractErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiResponse, MessageTemplate } from "@/lib/types";

const STATUS: Record<string, { label: string; className: string }> = {
	APPROVED: { label: "Aprovado", className: "bg-green-500/15 text-green-700 dark:text-green-400" },
	PENDING: { label: "Em análise", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
	REJECTED: { label: "Rejeitado", className: "bg-destructive/15 text-destructive" },
	PAUSED: { label: "Pausado", className: "bg-muted text-muted-foreground" },
	DISABLED: { label: "Desativado", className: "bg-muted text-muted-foreground" },
};

const CATEGORY: Record<string, string> = {
	UTILITY: "Utilidade",
	MARKETING: "Marketing",
	AUTHENTICATION: "Autenticação",
};

const EMPTY_FORM = {
	name: "",
	category: "UTILITY",
	language: "pt_BR",
	body: "",
	footer: "",
};

function countVariables(text: string) {
	const nums = (text.match(/\{\{\d+\}\}/g) ?? []).map((m) => m.replace(/\D/g, ""));
	return new Set(nums).size;
}

export default function ModelosPage() {
	const [templates, setTemplates] = React.useState<MessageTemplate[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [open, setOpen] = React.useState(false);
	const [form, setForm] = React.useState(EMPTY_FORM);
	const [examples, setExamples] = React.useState<string[]>([]);
	const [saving, setSaving] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [notice, setNotice] = React.useState<string | null>(null);

	const load = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get<ApiResponse<MessageTemplate[]>>("/templates");
			setTemplates(res.data.data ?? []);
		} catch (err) {
			setError(extractErrorMessage(err, "Erro ao carregar modelos."));
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		load();
	}, [load]);

	const varCount = countVariables(form.body);

	const setBody = (body: string) => {
		setForm((f) => ({ ...f, body }));
		const n = countVariables(body);
		setExamples((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? ""));
	};

	const openNew = () => {
		setForm(EMPTY_FORM);
		setExamples([]);
		setFormError(null);
		setOpen(true);
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setFormError(null);
		try {
			await api.post("/templates", { ...form, examples });
			setOpen(false);
			setNotice("Modelo enviado para análise da Meta. O status aparece como 'Em análise' até a aprovação.");
			await load();
		} catch (err) {
			setFormError(extractErrorMessage(err, "Falha ao criar modelo."));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div>
			<PageHeader
				title="Modelos de mensagem"
				description="Mensagens pré-aprovadas pela Meta, usadas para falar com leads fora da janela de 24h."
				actions={
					<>
						<Button variant="outline" onClick={load} disabled={loading}>
							<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
							Atualizar
						</Button>
						<Button onClick={openNew}>
							<Plus className="h-4 w-4" />
							Novo modelo
						</Button>
					</>
				}
			/>

			{error && <p className="mb-3 text-sm text-destructive">{error}</p>}
			{notice && <p className="mb-3 text-sm text-muted-foreground">{notice}</p>}

			<div className="rounded-xl border border-border bg-card shadow-sm">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nome</TableHead>
							<TableHead>Categoria</TableHead>
							<TableHead>Idioma</TableHead>
							<TableHead>Texto</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading && templates.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-muted-foreground">
									Carregando…
								</TableCell>
							</TableRow>
						) : templates.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-muted-foreground">
									Nenhum modelo cadastrado.
								</TableCell>
							</TableRow>
						) : (
							templates.map((t) => {
								const st = STATUS[t.status] ?? { label: t.status, className: "bg-muted" };
								return (
									<TableRow key={t.id}>
										<TableCell className="font-medium">{t.name}</TableCell>
										<TableCell>{CATEGORY[t.category] ?? t.category}</TableCell>
										<TableCell>{t.language}</TableCell>
										<TableCell className="max-w-md whitespace-pre-wrap text-sm text-muted-foreground">
											{t.body}
											{t.rejected_reason && (
												<span className="mt-1 block text-xs text-destructive">
													Motivo: {t.rejected_reason}
												</span>
											)}
										</TableCell>
										<TableCell>
											<span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", st.className)}>
												{st.label}
											</span>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
					<form onSubmit={submit} className="space-y-4">
						<DialogHeader>
							<DialogTitle>Novo modelo de mensagem</DialogTitle>
							<DialogDescription>
								Depois de enviado, a Meta analisa o modelo antes de liberar o uso.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-1.5">
							<Label htmlFor="tpl-name">Nome</Label>
							<Input
								id="tpl-name"
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
								placeholder="retorno_atendimento"
								required
							/>
							<p className="text-xs text-muted-foreground">Apenas letras minúsculas, números e _.</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label>Categoria</Label>
								<Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="UTILITY">Utilidade</SelectItem>
										<SelectItem value="MARKETING">Marketing</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label>Idioma</Label>
								<Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pt_BR">Português (BR)</SelectItem>
										<SelectItem value="en_US">Inglês (US)</SelectItem>
										<SelectItem value="es">Espanhol</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="tpl-body">Texto</Label>
							<Textarea
								id="tpl-body"
								rows={5}
								value={form.body}
								onChange={(e) => setBody(e.target.value)}
								placeholder="Olá {{1}}, estamos entrando em contato para dar continuidade ao seu atendimento."
								maxLength={1024}
								required
							/>
							<p className="text-xs text-muted-foreground">
								Use {"{{1}}"}, {"{{2}}"}… para variáveis (ex.: nome do lead). O texto não pode começar nem terminar com uma variável.
							</p>
						</div>

						{varCount > 0 && (
							<div className="space-y-2">
								<Label>Exemplos das variáveis</Label>
								{examples.map((ex, i) => (
									<Input
										key={i}
										value={ex}
										onChange={(e) =>
											setExamples((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))
										}
										placeholder={`Exemplo para {{${i + 1}}}`}
										required
									/>
								))}
							</div>
						)}

						<div className="space-y-1.5">
							<Label htmlFor="tpl-footer">Rodapé (opcional)</Label>
							<Input
								id="tpl-footer"
								value={form.footer}
								onChange={(e) => setForm({ ...form, footer: e.target.value })}
								maxLength={60}
							/>
						</div>

						{formError && <p className="text-sm text-destructive">{formError}</p>}

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>
								Cancelar
							</Button>
							<Button type="submit" disabled={saving}>
								{saving && <Loader2 className="h-4 w-4 animate-spin" />}
								Enviar para aprovação
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}