"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Calendar,
	CheckCircle2,
	ExternalLink,
	Loader as Loader2,
	XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api, extractErrorMessage } from "@/lib/api";
import type { ApiResponse, GoogleCalendar } from "@/lib/types";

function ClientCalendarConnectInner() {
	const router = useRouter();
	const params = useSearchParams();

	const [calendars, setCalendars] = React.useState<GoogleCalendar[] | null>(null);
	const [connected, setConnected] = React.useState(false);
	const [loading, setLoading] = React.useState(true);
	const [connecting, setConnecting] = React.useState(false);
	const [savingDefault, setSavingDefault] = React.useState(false);
	const [selectedCalendar, setSelectedCalendar] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [notice, setNotice] = React.useState<string | null>(null);

	const refresh = React.useCallback(async () => {
		setLoading(true);
		try {
			const res = await api.get<ApiResponse<GoogleCalendar[]>>("/calendar/calendars");
			const data = res.data.data ?? [];
			setCalendars(data);
			setConnected(true);
			const primary = data.find((c) => c.primary);
			if (primary) setSelectedCalendar(primary.id);
		} catch {
			// 404 = cliente ainda não conectou a agenda
			setConnected(false);
			setCalendars(null);
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		refresh();
	}, [refresh]);

	React.useEffect(() => {
		if (params.get("calendar_connected") === "1") {
			setNotice("Google Agenda conectada com sucesso.");
			router.replace("/perfil");
			refresh();
		} else if (params.get("calendar_error") === "1") {
			setError("Falha ao conectar com o Google Agenda. Tente novamente.");
			router.replace("/perfil");
		}
	}, [params, router, refresh]);

	const handleConnect = async () => {
		setConnecting(true);
		setError(null);
		try {
			const res = await api.get<ApiResponse<{ url: string }>>("/calendar/google/connect");
			window.location.href = res.data.data.url;
		} catch (err) {
			setError(extractErrorMessage(err, "Erro ao iniciar conexão com o Google."));
			setConnecting(false);
		}
	};

	const handleSetDefault = async (calendarId: string) => {
		setSelectedCalendar(calendarId);
		setSavingDefault(true);
		setError(null);
		try {
			await api.post("/calendar/default", { calendarId });
		} catch (err) {
			setError(extractErrorMessage(err, "Falha ao definir agenda padrão."));
		} finally {
			setSavingDefault(false);
		}
	};

	return (
		<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">Google Agenda</h2>
					<p className="text-sm text-muted-foreground">
						Conecte sua conta Google para permitir agendamentos automáticos.
					</p>
				</div>
				{!loading &&
					(connected ? (
						<span className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
							<CheckCircle2 className="h-3.5 w-3.5" />
							Conectado
						</span>
					) : (
						<span className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
							<XCircle className="h-3.5 w-3.5" />
							Não conectado
						</span>
					))}
			</div>

			{notice && (
				<p className="mb-3 text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>
			)}
			{error && <p className="mb-3 text-sm text-destructive">{error}</p>}

			{loading ? (
				<p className="text-sm text-muted-foreground">Verificando conexão…</p>
			) : !connected ? (
				<Button onClick={handleConnect} disabled={connecting}>
					{connecting ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Calendar className="h-4 w-4" />
					)}
					Conectar Google Agenda
				</Button>
			) : (
				<div className="space-y-4">
					<div className="max-w-sm space-y-1.5">
						<label className="text-sm font-medium">Agenda padrão</label>
						<Select
							value={selectedCalendar}
							onValueChange={handleSetDefault}
							disabled={savingDefault}
						>
							<SelectTrigger>
								<SelectValue placeholder="Selecione a agenda" />
							</SelectTrigger>
							<SelectContent>
								{calendars?.map((c) => (
									<SelectItem key={c.id} value={c.id}>
										{c.summary}
										{c.primary ? " (principal)" : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-xs text-muted-foreground">
							Usada quando nenhuma agenda específica for informada nos eventos.
						</p>
					</div>

					<Button variant="outline" size="sm" onClick={handleConnect} disabled={connecting}>
						<ExternalLink className="h-4 w-4" />
						Reconectar / trocar conta
					</Button>
				</div>
			)}
		</div>
	);
}

export function ClientCalendarConnect() {
	return (
		<React.Suspense fallback={null}>
			<ClientCalendarConnectInner />
		</React.Suspense>
	);
}