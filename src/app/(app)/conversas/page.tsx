"use client";

import * as React from "react";
import Link from "next/link";
import { Send, Loader as Loader2, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { api, extractErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiResponse, ChatConversation, ChatMessage, ClientLeadView } from "@/lib/types";

const POLL_MS = 10000;

function timeLabel(value: string | null) {
	if (!value) return "";
	return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

const STATUS_LABEL: Record<string, string> = {
	sent: "enviada",
	delivered: "entregue",
	read: "lida",
};

function failureReason(m: ChatMessage) {
	if (m.error_code === 131047) {
		return "passaram mais de 24h desde a última mensagem do lead. Só é possível enviar um template aprovado.";
	}
	return m.error_message || "falha no envio pelo WhatsApp.";
}

export default function ConversasPage() {
	const [leads, setLeads] = React.useState<ClientLeadView[]>([])
	const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
	const [selected, setSelected] = React.useState<ChatConversation | null>(null);
	const [messages, setMessages] = React.useState<ChatMessage[]>([]);
	const [text, setText] = React.useState("");
	const [sending, setSending] = React.useState(false);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [search, setSearch] = React.useState("");
	const bottomRef = React.useRef<HTMLDivElement>(null);

	const filtered = React.useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return conversations;
		return conversations.filter(
			(c) =>
				(c.name ?? "").toLowerCase().includes(q) ||
				(c.whatsapp_number ?? "").includes(q)
		);
	}, [conversations, search]);

	const loadConversations = React.useCallback(async () => {
		try {
			const res = await api.get<ApiResponse<ChatConversation[]>>("/chat/conversations");
			setConversations(res.data.data ?? []);
		} catch (err) {
			setError(extractErrorMessage(err, "Erro ao carregar conversas."));
		} finally {
			setLoading(false);
		}
	}, []);

	const leadList = React.useCallback(async () => {
		try {
			const res = await api.get<ApiResponse<ClientLeadView[]>>("/leads")
			setLeads(res.data.data ?? [])
			console.log(res.data.data)
		} catch (err) {
			setError(extractErrorMessage(err, "Erro ao carregar conversas."));
		}
	}, [])

	// Lista de conversas (polling)
	React.useEffect(() => {
		loadConversations();
		leadList();
		const t = setInterval(loadConversations, POLL_MS);
		return () => clearInterval(t);
	}, [loadConversations]);

	// Mensagens da conversa selecionada (carga inicial + polling incremental)
	const leadId = selected?.lead_id;
	React.useEffect(() => {
		if (!leadId) return;
		let cancelled = false;
		setMessages([]);

		// Busca a conversa inteira a cada ciclo: assim os status (entregue/lida/falhou)
		// atualizados pelo webhook também aparecem.
		const fetchNew = async () => {
			try {
				const res = await api.get<ApiResponse<ChatMessage[]>>(
					`/chat/conversations/${leadId}/messages`
				);
				if (cancelled) return;
				const all = res.data.data ?? [];
				setMessages((prev) => (JSON.stringify(prev) === JSON.stringify(all) ? prev : all));
			} catch (err) {
				if (!cancelled) setError(extractErrorMessage(err, "Erro ao carregar mensagens."));
			}
		};

		fetchNew();
		const t = setInterval(fetchNew, POLL_MS);
		return () => {
			cancelled = true;
			clearInterval(t);
		};
	}, [leadId]);

	React.useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selected || !text.trim() || sending) return;
		setSending(true);
		setError(null);
		try {
			const res = await api.post<ApiResponse<ChatMessage>>(
				`/chat/conversations/${selected.lead_id}/messages`,
				{ body: text }
			);
			const msg = { ...res.data.data, created_at: new Date().toISOString() };
			setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
			setText("");
			loadConversations();
		} catch (err) {
			setError(extractErrorMessage(err, "Falha ao enviar mensagem."));
		} finally {
			setSending(false);
		}
	};

	return (
		<div>
			<PageHeader title="Conversas" description="Converse com seus leads pelo WhatsApp." />

			{error && <p className="mb-3 text-sm text-destructive">{error}</p>}

			<div className="flex h-[calc(100vh-11rem)] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
				{/* Lista */}
				<aside className="flex w-80 shrink-0 flex-col border-r border-border">
					<div className="relative border-b border-border p-3">
						<Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar lead por nome" className="pl-8" />
					</div>
					<div className="relative p-3">
						<Button onClick={() => leadList()}>Teste</Button>
					</div>
					<div className="flex-1 overflow-y-auto">
						{loading ? (
							<p className="p-4 text-sm text-muted-foreground">Carregando…</p>
						) : filtered.length === 0 ? (
							<p className="p-4 text-sm text-muted-foreground">
								{conversations.length === 0 ? "Nenhum lead cadastrado." : "Nenhum lead encontrado."}
							</p>
						) : (
							filtered.map((c) => (
								<button
									key={c.lead_id}
									type="button"
									onClick={() => setSelected(c)}
									className={cn(
										"flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50",
										selected?.lead_id === c.lead_id && "bg-muted"
									)}
								>
									<div className="flex items-center justify-between gap-2">
										<span className="truncate text-sm font-medium">
											{c.name || c.whatsapp_number}
										</span>
										<span className="shrink-0 text-xs text-muted-foreground">
											{timeLabel(c.last_at)}
										</span>
									</div>
									<span className="truncate text-xs text-muted-foreground">
										{c.last_body
											? `${c.last_direction === "out" ? "Você: " : ""}${c.last_body}`
											: c.whatsapp_number
												? "Iniciar conversa"
												: "Sem WhatsApp"}
									</span>
								</button>
							))
						)}
					</div>
				</aside>

				{/* Conversa */}
				<section className="flex min-w-0 flex-1 flex-col">
					{!selected ? (
						<div className="grid flex-1 place-items-center text-sm text-muted-foreground">
							<div className="flex flex-col items-center gap-2">
								<MessageSquare className="h-8 w-8" />
								Selecione uma conversa
							</div>
						</div>
					) : (
						<>
							<header className="border-b border-border px-4 py-3">
								<p className="text-sm font-medium">{selected.name || selected.whatsapp_number}</p>
								<p className="text-xs text-muted-foreground">
									{selected.whatsapp_number || "Sem número de WhatsApp"}
								</p>
							</header>

							<div className="flex-1 space-y-2 overflow-y-auto bg-muted/30 p-4">
								{messages.length === 0 && (
									<p className="pt-8 text-center text-sm text-muted-foreground">
										{selected.whatsapp_number
											? "Nenhuma mensagem ainda. Envie a primeira mensagem para iniciar a conversa."
											: "Este lead não possui WhatsApp cadastrado. Edite o lead para adicionar o número."}
									</p>
								)}
								{messages.map((m) => (
									<div
										key={m.id}
										className={cn("flex", m.direction === "out" ? "justify-end" : "justify-start")}
									>
										<div
											className={cn(
												"max-w-[70%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm shadow-sm",
												m.status === "failed"
													? "border border-destructive bg-destructive/10 text-foreground"
													: m.direction === "out"
														? "bg-primary text-primary-foreground"
														: "bg-card"
											)}
										>
											{m.body}
											<div className="mt-1 text-right text-[10px] opacity-70">
												{m.sender === "ai" ? "IA · " : ""}
												{timeLabel(m.created_at)}
												{m.direction === "out" && m.status !== "failed" && (
													<> · {STATUS_LABEL[m.status] ?? m.status}</>
												)}
											</div>
											{m.status === "failed" && (
												<p className="mt-1 text-[11px] font-medium text-destructive">
													Não enviada: {failureReason(m)}
												</p>
											)}
										</div>
									</div>
								))}
								<div ref={bottomRef} />
							</div>

							<form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
								<Input
									value={text}
									onChange={(e) => setText(e.target.value)}
									placeholder="Digite uma mensagem"
									disabled={sending || !selected.whatsapp_number}
								/>
								<Button type="submit" disabled={sending || !text.trim() || !selected.whatsapp_number}>
									{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
									Enviar
								</Button>
							</form>
						</>
					)}
				</section>
			</div>
		</div>
	);
}
