"use client";

import * as React from "react";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	closestCorners,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { api, extractErrorMessage } from "@/lib/api";
import type { BoardLead, BoardStage } from "@/lib/types";
import { KanbanColumn, stageKey } from "./kanban-column";
import { LeadCardContent, leadKey } from "./kanban-lead-card";

interface KanbanBoardProps {
	stages: BoardStage[];
	onReload: () => void | Promise<void>;
	basePath?: string;
}

export function KanbanBoard({ stages, onReload, basePath = "/leads" }: KanbanBoardProps) {
	const [columns, setColumns] = React.useState<BoardStage[]>(stages);
	const [activeLead, setActiveLead] = React.useState<BoardLead | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	const snapshot = React.useRef<BoardStage[]>(stages);

	React.useEffect(() => {
		setColumns(stages);
	}, [stages]);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
	);

	// Retorna a coluna que contém o id (de coluna ou de lead)
	const findColumn = (id: string, cols: BoardStage[]) => {
		if (id.startsWith("stage-")) return cols.find((c) => stageKey(c.id) === id);
		return cols.find((c) => c.leads.some((l) => leadKey(l.id) === id));
	};

	const onDragStart = (event: DragStartEvent) => {
		snapshot.current = columns;
		const id = String(event.active.id);
		const col = findColumn(id, columns);
		setActiveLead(col?.leads.find((l) => leadKey(l.id) === id) ?? null);
		setError(null);
	};

	const onDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over) return;
		const activeId = String(active.id);
		const overId = String(over.id);

		setColumns((cols) => {
			const from = findColumn(activeId, cols);
			const to = findColumn(overId, cols);
			if (!from || !to || from.id === to.id) return cols;

			const moving = from.leads.find((l) => leadKey(l.id) === activeId);
			if (!moving) return cols;

			let newIndex = to.leads.length;
			if (!overId.startsWith("stage-")) {
				const overIndex = to.leads.findIndex((l) => leadKey(l.id) === overId);
				const translated = active.rect.current.translated;
				const below = translated ? translated.top > over.rect.top + over.rect.height / 2 : false;
				newIndex = overIndex + (below ? 1 : 0);
			}

			return cols.map((c) => {
				if (c.id === from.id) return { ...c, leads: c.leads.filter((l) => l.id !== moving.id) };
				if (c.id === to.id) {
					const leads = [...c.leads];
					leads.splice(newIndex, 0, { ...moving, stage_id: to.id });
					return { ...c, leads };
				}
				return c;
			});
		});
	};

	const onDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveLead(null);

		if (!over) {
			setColumns(snapshot.current);
			return;
		}

		const activeId = String(active.id);
		const overId = String(over.id);
		const col = findColumn(activeId, columns);
		if (!col) return;

		let leads = col.leads;
		const oldIndex = leads.findIndex((l) => leadKey(l.id) === activeId);
		let newIndex = oldIndex;

		if (!overId.startsWith("stage-")) {
			const overIndex = leads.findIndex((l) => leadKey(l.id) === overId);
			if (overIndex >= 0 && overIndex !== oldIndex) {
				leads = arrayMove(leads, oldIndex, overIndex);
				newIndex = overIndex;
				setColumns((cols) => cols.map((c) => (c.id === col.id ? { ...c, leads } : c)));
			}
		}

		const origin = findColumn(activeId, snapshot.current);
		const originIndex = origin?.leads.findIndex((l) => leadKey(l.id) === activeId) ?? -1;
		if (origin?.id === col.id && originIndex === newIndex) return;

		try {
			await api.put(`/leads/${leads[newIndex].id}/stage`, {
				stage_id: col.id,
				position: newIndex,
			});
		} catch (err) {
			setError(extractErrorMessage(err, "Não foi possível mover o lead."));
			setColumns(snapshot.current);
			await onReload();
		}
	};

	return (
		<div>
			{error && <p className="mb-3 text-sm text-destructive">{error}</p>}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={onDragStart}
				onDragOver={onDragOver}
				onDragEnd={onDragEnd}
				onDragCancel={() => {
					setActiveLead(null);
					setColumns(snapshot.current);
				}}
			>
				<div className="flex items-start gap-4 overflow-x-auto pb-4">
					{columns.map((stage) => (
						<KanbanColumn key={stage.id} stage={stage} basePath={basePath} />
					))}
				</div>
				<DragOverlay>
					{activeLead ? <LeadCardContent lead={activeLead} overlay /> : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}
