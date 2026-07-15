"use client";

import * as React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { ptBR } from "date-fns/locale/pt-BR";
import { Pencil, Trash2, X, Users, FileText, CalendarDays, Mail } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-view.css";

import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EventFormDialog } from "@/components/shared/event-form-dialog";
import { api, extractErrorMessage } from "@/lib/api";
import type { GoogleCalendarEvent } from "@/lib/types";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
});

const responseLabel: Record<string, string> = {
	accepted: "confirmado",
	declined: "recusado",
	tentative: "talvez",
	needsAction: "pendente",
};

interface CalendarEventItem {
	title: string;
	start: Date;
	end: Date;
	resource: GoogleCalendarEvent;
}

interface CalendarViewProps {
	events: CalendarEventItem[];
	calendarId?: string;
	onChanged?: () => Promise<void> | void;
}

function formatRange(event: GoogleCalendarEvent) {
	const start = event.start.dateTime ? new Date(event.start.dateTime) : null;
	const end = event.end.dateTime ? new Date(event.end.dateTime) : null;
	if (!start || !end) return "";
	const dateLabel = new Intl.DateTimeFormat("pt-BR", {
		weekday: "long",
		day: "2-digit",
		month: "long",
	}).format(start);
	const startLabel = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(start);
	const endLabel = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(end);
	return `${dateLabel} · ${startLabel} – ${endLabel}`;
}

export function CalendarView({ events, calendarId, onChanged }: CalendarViewProps) {
	const [selected, setSelected] = React.useState<GoogleCalendarEvent | null>(null);
	const [anchorPos, setAnchorPos] = React.useState<{ x: number; y: number } | null>(null);
	const [popoverOpen, setPopoverOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [deleteError, setDeleteError] = React.useState<string | null>(null);

	const handleSelectEvent = ( event: { resource?: GoogleCalendarEvent }, e: React.SyntheticEvent<HTMLElement>) => {
		if (!event.resource) return;
		const rect = (e.target as HTMLElement).getBoundingClientRect();
		setAnchorPos({ x: rect.left + rect.width / 2, y: rect.top });
		setSelected(event.resource);
		setDeleteError(null);
		setPopoverOpen(true);
	};

	const hidePopover= () => setPopoverOpen(false)

	const closeAndClear  = () => {
		setPopoverOpen(false);
		setSelected(null);
	};

	const handleDelete = async () => {
		if (!selected) return;
		try {
			await api.delete(`/calendar/events/${selected.id}`, { params: { calendarId } });
			setDeleteOpen(false);
			closeAndClear();
			await onChanged?.();
		} catch (err) {
			setDeleteError(extractErrorMessage(err, "Falha ao excluir evento."));
		}
	};

	return (
		<div style={{ height: 700 }}>
			<Calendar
				localizer={localizer}
				events={events}
				startAccessor="start"
				endAccessor="end"
				culture="pt-BR"
				views={["month", "week", "day", "agenda"]}
				onSelectEvent={handleSelectEvent}
			/>

			<Popover open={popoverOpen} onOpenChange={(o) => !o && hidePopover()}>
				<PopoverAnchor asChild>
					<div
						style={{
							position: "fixed",
							left: anchorPos?.x ?? 0,
							top: anchorPos?.y ?? 0,
							width: 1,
							height: 1,
						}}
					/>
				</PopoverAnchor>

				{selected && (
					<PopoverContent align="start" side="bottom">
						<div className="flex items-start justify-between gap-2">
							<h3 className="text-base font-semibold leading-snug">
								{selected.summary || "(Sem título)"}
							</h3>
							<div className="flex shrink-0 items-center gap-1">
								<Button variant="ghost" size="icon-sm" aria-label="Editar" onClick={() => setEditOpen(true)}>
									<Pencil className="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="icon-sm" aria-label="Excluir" onClick={() => setDeleteOpen(true)}>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
								<Button variant="ghost" size="icon-sm" aria-label="Fechar" onClick={closeAndClear}>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</div>

						<p className="mt-1 text-sm text-muted-foreground">{formatRange(selected)}</p>

						{selected.attendees && selected.attendees.length > 0 && (
							<div className="mt-3 flex items-start gap-2 text-sm">
								<Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
								<div className="space-y-0.5">
									{selected.attendees.map((a) => (
										<div key={a.email} className="flex items-center gap-1.5">
											<Mail className="h-3.5 w-3.5 text-muted-foreground" />
											<span>{a.displayName || a.email}</span>
											{a.responseStatus && (
												<span className="text-xs text-muted-foreground">
													({responseLabel[a.responseStatus] ?? a.responseStatus})
												</span>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						{selected.description && (
							<div className="mt-3 flex items-start gap-2 text-sm">
								<FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
								<p className="whitespace-pre-wrap text-muted-foreground">{selected.description}</p>
							</div>
						)}

						{selected.organizer?.displayName && (
							<div className="mt-3 flex items-center gap-2 text-sm">
								<CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
								<span>{selected.organizer.displayName}</span>
							</div>
						)}
					</PopoverContent>
				)}
			</Popover>

			<EventFormDialog
				open={editOpen}
				onOpenChange={setEditOpen}
				calendarId={calendarId}
				event={selected}
				onSaved={async () => {
					setEditOpen(false);
					closeAndClear();
					await onChanged?.();
				}}
			/>

			<ConfirmDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				title="Excluir evento?"
				description={deleteError ?? "Esta ação não poderá ser desfeita."}
				destructive
				confirmLabel="Excluir"
				onConfirm={handleDelete}
			/>
		</div>
	);
}