"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api, extractErrorMessage } from "@/lib/api";
import type { BoardStage, StageKind } from "@/lib/types";

const KIND_LABEL: Record<StageKind, string> = {
	open: "Em andamento",
	won: "Ganho",
	lost: "Perdido",
};

interface StageManagerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	stages: BoardStage[];
	onChanged: () => void | Promise<void>;
}

export function StageManager({ open, onOpenChange, stages, onChanged }: StageManagerProps) {
	const [error, setError] = React.useState<string | null>(null);
	const [busy, setBusy] = React.useState(false);
	const [names, setNames] = React.useState<Record<number, string>>({});
	const [newName, setNewName] = React.useState("");
	const [newColor, setNewColor] = React.useState("#64748b");
	const [newKind, setNewKind] = React.useState<StageKind>("open");
	const [toDelete, setToDelete] = React.useState<BoardStage | null>(null);
	const [moveTo, setMoveTo] = React.useState<string>("");

	React.useEffect(() => {
		setNames(Object.fromEntries(stages.map((s) => [s.id, s.name])));
	}, [stages]);

	const run = async (fn: () => Promise<unknown>, fallback: string) => {
		setBusy(true);
		setError(null);
		try {
			await fn();
			await onChanged();
		} catch (err) {
			setError(extractErrorMessage(err, fallback));
		} finally {
			setBusy(false);
		}
	};

	const patch = (id: number, data: Record<string, unknown>) =>
		run(() => api.put(`/stages/${id}`, data), "Falha ao atualizar a raia.");

	const rename = (stage: BoardStage) => {
		const name = (names[stage.id] ?? "").trim();
		if (!name) {
			setNames((n) => ({ ...n, [stage.id]: stage.name }));
			return;
		}
		if (name !== stage.name) void patch(stage.id, { name });
	};

	const move = (index: number, dir: -1 | 1) => {
		const ids = stages.map((s) => s.id);
		const target = index + dir;
		if (target < 0 || target >= ids.length) return;
		[ids[index], ids[target]] = [ids[target], ids[index]];
		void run(() => api.put("/stages/reorder", { ids }), "Falha ao reordenar.");
	};

	const add = () => {
		const name = newName.trim();
		if (!name) return;
		void run(async () => {
			await api.post("/stages", { name, color: newColor, kind: newKind });
			setNewName("");
			setNewKind("open");
		}, "Falha ao criar a raia.");
	};

	const confirmDelete = async () => {
		if (!toDelete) return;
		const params = moveTo ? { move_to: moveTo } : undefined;
		await run(() => api.delete(`/stages/${toDelete.id}`, { params }), "Falha ao remover a raia.");
		setToDelete(null);
	};

	const openDelete = (stage: BoardStage) => {
		const fallback = stages.find((s) => s.id !== stage.id);
		setMoveTo(fallback ? String(fallback.id) : "");
		setToDelete(stage);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Gerenciar raias</DialogTitle>
						<DialogDescription>
							Renomeie, reordene, adicione ou remova as raias do seu quadro.
						</DialogDescription>
					</DialogHeader>

					<div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
						{stages.map((stage, i) => (
							<div
								key={stage.id}
								className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2"
							>
								<input
									type="color"
									aria-label="Cor da raia"
									className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
									value={stage.color || "#64748b"}
									onChange={(e) => patch(stage.id, { color: e.target.value })}
									disabled={busy}
								/>
								<Input
									className="min-w-32 flex-1"
									value={names[stage.id] ?? stage.name}
									maxLength={60}
									disabled={busy}
									onChange={(e) => setNames((n) => ({ ...n, [stage.id]: e.target.value }))}
									onBlur={() => rename(stage)}
									onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
								/>
								<Select
									value={stage.kind}
									onValueChange={(v) => patch(stage.id, { kind: v })}
									disabled={busy}
								>
									<SelectTrigger className="w-36">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{(Object.keys(KIND_LABEL) as StageKind[]).map((k) => (
											<SelectItem key={k} value={k}>
												{KIND_LABEL[k]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									title={stage.is_default ? "Raia padrão (novos leads)" : "Definir como padrão"}
									disabled={busy || Boolean(stage.is_default)}
									onClick={() => patch(stage.id, { is_default: true })}
								>
									<Star
										className={`h-4 w-4 ${stage.is_default ? "fill-amber-400 text-amber-400" : ""}`}
									/>
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									disabled={busy || i === 0}
									onClick={() => move(i, -1)}
								>
									<ArrowUp className="h-4 w-4" />
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									disabled={busy || i === stages.length - 1}
									onClick={() => move(i, 1)}
								>
									<ArrowDown className="h-4 w-4" />
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									disabled={busy || stages.length <= 1}
									onClick={() => openDelete(stage)}
								>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							</div>
						))}
					</div>

					<div className="space-y-1.5 rounded-lg border border-dashed border-border p-3">
						<Label>Nova raia</Label>
						<div className="flex flex-wrap items-center gap-2">
							<input
								type="color"
								aria-label="Cor da nova raia"
								className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
								value={newColor}
								onChange={(e) => setNewColor(e.target.value)}
							/>
							<Input
								className="min-w-32 flex-1"
								placeholder="Nome da raia"
								maxLength={60}
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && add()}
							/>
							<Select value={newKind} onValueChange={(v) => setNewKind(v as StageKind)}>
								<SelectTrigger className="w-36">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(Object.keys(KIND_LABEL) as StageKind[]).map((k) => (
										<SelectItem key={k} value={k}>
											{KIND_LABEL[k]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button type="button" onClick={add} disabled={busy || !newName.trim()}>
								<Plus className="h-4 w-4" />
								Adicionar
							</Button>
						</div>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}

					<DialogFooter>
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Fechar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Remover a raia &quot;{toDelete?.name}&quot;?</DialogTitle>
						<DialogDescription>
							{toDelete && toDelete.leads.length > 0
								? `Os ${toDelete.leads.length} lead(s) desta raia serão movidos para a raia escolhida.`
								: "Esta raia não tem leads."}
						</DialogDescription>
					</DialogHeader>
					{toDelete && toDelete.leads.length > 0 && (
						<div className="space-y-1.5">
							<Label>Mover leads para</Label>
							<Select value={moveTo} onValueChange={setMoveTo}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{stages
										.filter((s) => s.id !== toDelete.id)
										.map((s) => (
											<SelectItem key={s.id} value={String(s.id)}>
												{s.name}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setToDelete(null)} disabled={busy}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={confirmDelete} disabled={busy}>
							Remover
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
