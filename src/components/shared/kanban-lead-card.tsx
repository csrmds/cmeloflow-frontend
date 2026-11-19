"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AtSign, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoardLead, StageKind } from "@/lib/types";

export const leadKey = (id: number) => `lead-${id}`;

function daysInStage(value: string | null): number | null {
	if (!value) return null;
	const diff = Date.now() - new Date(value).getTime();
	return Number.isFinite(diff) ? Math.floor(diff / 86_400_000) : null;
}

export function LeadCardContent({
	lead,
	overlay,
	stageKind = "open",
}: {
	lead: BoardLead;
	overlay?: boolean;
	stageKind?: StageKind;
}) {
	const human = Number(lead.human_handover) === 1;
	const days = stageKind === "open" ? daysInStage(lead.stage_changed_at) : null;
	return (
		<div
			className={cn(
				"rounded-lg border border-border bg-card p-3 shadow-sm",
				overlay && "rotate-2 cursor-grabbing shadow-lg"
			)}
		>
			<div className="flex items-start justify-between gap-2">
				<p className="truncate text-sm font-medium">{lead.name || "Sem nome"}</p>
				<span
					className={cn(
						"shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
						human
							? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
							: "bg-muted text-muted-foreground"
					)}
				>
					{human ? "Humano" : "IA"}
				</span>
			</div>
			<div className="mt-2 space-y-1 text-xs text-muted-foreground">
				{lead.whatsapp_number && (
					<p className="flex items-center gap-1.5 truncate">
						<MessageCircle className="h-3 w-3 shrink-0" />
						{lead.whatsapp_number}
					</p>
				)}
				{lead.instagram_username && (
					<p className="flex items-center gap-1.5 truncate">
						<AtSign className="h-3 w-3 shrink-0" />
						{lead.instagram_username}
					</p>
				)}
			</div>
			{days !== null && days >= 7 && (
				<p className="mt-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
					Parado há {days} dias
				</p>
			)}
			{lead.notes && (
				<p className="mt-2 line-clamp-2 text-xs text-muted-foreground/80">{lead.notes}</p>
			)}
		</div>
	);
}

export function KanbanLeadCard({
	lead,
	basePath,
	stageKind,
}: {
	lead: BoardLead;
	basePath: string;
	stageKind: StageKind;
}) {
	const router = useRouter();
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: leadKey(lead.id),
	});

	return (
		<div
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")}
			onClick={() => router.push(`${basePath}/${lead.id}`)}
			{...attributes}
			{...listeners}
		>
			<LeadCardContent lead={lead} stageKind={stageKind} />
		</div>
	);
}
