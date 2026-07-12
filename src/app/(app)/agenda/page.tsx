"use client"

import * as React from "react"
import { CalendarPlus } from "lucide-react"
import { startOfMonth, endOfMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { api, extractErrorMessage } from "@/lib/api"
import { GoogleCalendarEvent, ApiResponse } from "@/lib/types"
import { CalendarView } from "@/components/shared/calendar-view"
import { EventFormDialog } from "@/components/shared/event-form-dialog"

export default function AgendaPage() {
	const [rawEvents, setRawEvents] = React.useState<GoogleCalendarEvent[]>([])
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [open, setOpen] = React.useState(false)

	const fetchEvents = React.useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const now = new Date()
			const timeMin = startOfMonth(now).toISOString()
			const timeMax = endOfMonth(now).toISOString()
			const res = await api.get<ApiResponse<GoogleCalendarEvent[]>>("/calendar/events", {
				params: { timeMin, timeMax },
			})
			setRawEvents(res.data.data ?? [])
		} catch (err) {
			setError(extractErrorMessage(err, "Erro ao carregar agenda."))
		} finally {
			setLoading(false)
		}
	}, [])

	React.useEffect(() => {
		fetchEvents()
	}, [fetchEvents])

	const events = rawEvents.map((e) => ({
		title: e.summary,
		start: new Date(e.start.dateTime ?? e.start.date ?? ""),
		end: new Date(e.end.dateTime ?? e.end.date ?? ""),
	}))

	return (
		<div>
			<PageHeader
				title="Agenda"
				description="Acompanhe os próximos agendamentos"
				actions={
					<Button onClick={() => setOpen(true)}>
						<CalendarPlus className="h-4 w-4" />
						Novo Evento
					</Button>
				}
			/>

			{error && <p className="mb-4 text-sm text-destructive">{error}</p>}
			{loading ? (
				<p className="text-sm text-muted-foreground">Carregando…</p>
			) : (
				<CalendarView events={events} />
			)}

			<EventFormDialog open={open} onOpenChange={setOpen} onSaved={fetchEvents} />
		</div>
	)
}