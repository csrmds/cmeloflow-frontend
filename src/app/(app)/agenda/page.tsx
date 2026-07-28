"use client"

import * as React from "react"
import { CalendarPlus } from "lucide-react"
import { startOfMonth, endOfMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { api, extractErrorMessage } from "@/lib/api"
import { GoogleCalendarEvent, GoogleCalendar, CalendarStatus, ApiResponse } from "@/lib/types"
import { CalendarView } from "@/components/shared/calendar-view"
import { EventFormDialog } from "@/components/shared/event-form-dialog"

export default function AgendaPage() {
	const [status, setStatus] = React.useState<CalendarStatus | null>(null)
	const [calendars, setCalendars] = React.useState<GoogleCalendar[]>([])
	const [selectedCalendar, setSelectedCalendar] = React.useState("")
	const [rawEvents, setRawEvents] = React.useState<GoogleCalendarEvent[]>([])
	const [loadingCalendars, setLoadingCalendars] = React.useState(true)
	const [loadingEvents, setLoadingEvents] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [open, setOpen] = React.useState(false)

	// Carrega a lista de agendas + qual está salva como padrão
	React.useEffect(() => {
		let cancelled = false
		;(async () => {
			setLoadingCalendars(true)
			setError(null)
			try {
				const statusRes = await api.get<ApiResponse<CalendarStatus>>("/calendar/status")
				if (cancelled) return
				setStatus(statusRes.data.data)

				if (statusRes.data.data.status === "connected") {
					const [calendarsRes, defaultRes] = await Promise.all([
						api.get<ApiResponse<GoogleCalendar[]>>("/calendar/calendars"),
						api.get<ApiResponse<{ calendarId: string }>>("/calendar/default"),
					])
					if (cancelled) return
					setCalendars(calendarsRes.data.data ?? [])
					setSelectedCalendar(defaultRes.data.data.calendarId || "primary")
				}
			} catch (err) {
				if (cancelled) return
				setStatus({ connected: false, status: "error", email: null })
				setError(extractErrorMessage(err, "Erro ao consultar status da agenda."))
			} finally {
				if (!cancelled) setLoadingCalendars(false)
			}
		})()
		return () => { cancelled = true }
	}, [])

	const fetchEvents = React.useCallback(async (calendarId: string) => {
		if (!calendarId) return
		setLoadingEvents(true)
		setError(null)
		try {
			const now = new Date()
			const timeMin = startOfMonth(now).toISOString()
			const timeMax = endOfMonth(now).toISOString()
			const res = await api.get<ApiResponse<GoogleCalendarEvent[]>>("/calendar/events", {
				params: { timeMin, timeMax, calendarId },
			})
			setRawEvents(res.data.data ?? [])
		} catch (err) {
			setError(extractErrorMessage(err, "Erro ao carregar agenda."))
		} finally {
			setLoadingEvents(false)
		}
	}, [])

	React.useEffect(() => {
		if (status?.status === "connected" && selectedCalendar) fetchEvents(selectedCalendar)
	}, [status, selectedCalendar, fetchEvents])

	const handleChangeCalendar = async (calendarId: string) => {
		setSelectedCalendar(calendarId)
		try {
			await api.post("/calendar/default", { calendarId })
		} catch {
			// não bloqueia a troca visual se falhar em persistir a preferência
		}
	}

	const events = rawEvents.map((e) => ({
		title: e.summary,
		start: new Date(e.start.dateTime ?? e.start.date ?? ""),
		end: new Date(e.end.dateTime ?? e.end.date ?? ""),
		resource: e,
	}))

	return (
		<div>
			<PageHeader
				title="Agenda"
				description="Acompanhe os próximos agendamentos"
				actions={
					<div className="flex items-center gap-2">
						{status?.status=== "connected" && calendars.length > 0 && (
							<Select value={selectedCalendar} onValueChange={handleChangeCalendar}>
								<SelectTrigger className="w-56">
									<SelectValue placeholder="Selecione a agenda" />
								</SelectTrigger>
								<SelectContent>
									{calendars.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{c.summary}
											{c.primary ? " (principal)" : ""}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						<Button onClick={() => setOpen(true)}>
							<CalendarPlus className="h-4 w-4" />
							Novo Evento
						</Button>
					</div>
				}
			/>

			{error && <p className="mb-4 text-sm text-destructive">{error}</p>}

			{loadingCalendars ? (
				<p className="text-sm text-muted-foreground">Verificando conexão…</p>
			) : status?.status === "not_connected" ? (
				<p className="text-sm text-muted-foreground">
					Conecte o Google Agenda em Perfil para visualizar seus compromissos.
				</p>
			) : status?.status === "error" ? (
				<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					<p>{status.error_message ?? "Erro na conexão com o Google Agenda."}</p>
					{status.email && <p className="mt-1 text-xs opacity-80">Conta: {status.email}</p>}
					<p className="mt-1 text-xs">Vá em Perfil para reconectar.</p>
				</div>
			) : loadingEvents ? (
				<p className="text-sm text-muted-foreground">Carregando…</p>
			) : (
				<CalendarView
					events={events}
					calendarId={selectedCalendar}
					onChanged={() => fetchEvents(selectedCalendar)}
				/>
			)}

			<EventFormDialog
				open={open}
				onOpenChange={setOpen}
				calendarId={selectedCalendar}
				onSaved={() => fetchEvents(selectedCalendar)}
			/>
		</div>
	)
}