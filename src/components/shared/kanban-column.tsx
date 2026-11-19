"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CircleCheck, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoardStage } from "@/lib/types";
import { KanbanLeadCard, leadKey } from "./kanban-lead-card";

export const stageKey = (id: number) => `stage-${id}`;

export function KanbanColumn({ stage, basePath }: { stage: BoardStage; basePath: string }) {
	const { setNodeRef, isOver } = useDroppable({ id: stageKey(stage.id) });
	const color = stage.color || "#64748b";

	return (
		<div className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/40">
			<div className="flex items-center gap-2 px-3 py-3">
				<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
				<h3 className="truncate text-sm font-semibold">{stage.name}</h3>
				{stage.kind === "won" && <CircleCheck className="h-4 w-4 text-emerald-500" />}
				{stage.kind === "lost" && <CircleX className="h-4 w-4 text-red-500" />}
				<span className="ml-auto rounded-md bg-background px-1.5 py-0.5 text-xs text-muted-foreground">
					{stage.leads.length}
				</span>
			</div>
			<div
				ref={setNodeRef}
				className={cn(
					"flex min-h-24 flex-1 flex-col gap-2 rounded-b-xl p-2 transition-colors",
					isOver && "bg-primary/5"
				)}
			>
				<SortableContext
					items={stage.leads.map((l) => leadKey(l.id))}
					strategy={verticalListSortingStrategy}
				>
					{stage.leads.map((lead) => (
						<KanbanLeadCard key={lead.id} lead={lead} basePath={basePath} />
					))}
				</SortableContext>
				{stage.leads.length === 0 && (
					<p className="py-6 text-center text-xs text-muted-foreground">Arraste leads para cá</p>
				)}
			</div>
		</div>
	);
}
