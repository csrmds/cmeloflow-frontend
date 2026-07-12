"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { api } from "@/lib/api"
import { GoogleCalendarDateTime, GoogleCalendarEvent, GoogleCalendarEventInput, GoogleCalendar } from "@/lib/types"
import { CalendarView } from "@/components/shared/calendar-view"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";


export default function AgendaPage() {
	const [calendarEvent, setCalendarEvent] = React.useState<GoogleCalendarEvent[]>([])
	const [open, setOpen] = React.useState(false);

	const data= [
		{
			title: "titulo do agendamento",
			start: "2026-07-13T09:00:00-03:00",
			end: "2026-07-13T12:00:00-03:00"
		}
	]

	const events= data.map((e) => ({
		title: e.title,
		start: new Date(e.start),
		end: new Date(e.end)
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
			
			<CalendarView events={events} ></CalendarView>

			<Dialog open={open} onOpenChange={setOpen}>
				
				
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Titulo caixa diaglogo</DialogTitle>
					</DialogHeader>
					<p>algum conteudo</p>
					<DialogFooter>Rodapé</DialogFooter>
				</DialogContent>
				
			</Dialog>
		</div>
	)

}


