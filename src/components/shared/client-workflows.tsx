"use client";

import * as React from "react";
import { Plus, Trash2, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableEmpty,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { api, extractErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ApiResponse, Workflow as WorkflowType } from "@/lib/types";

interface ClientWorkflow {
	id: number;
	client_id: number;
	workflow_id: string;
	workflow_name: string | null;
	workflow_description: string | null;
	active: number | boolean;
	created_at: string | null;
	updated_at: string | null;
}

interface ClientWorkflowsProps {
	clientId: number;
}

export function ClientWorkflows({ clientId }: ClientWorkflowsProps) {
	const [clientWorkflows, setClientWorkflows] = React.useState<ClientWorkflow[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [open, setOpen] = React.useState(false);
	const [deleteId, setDeleteId] = React.useState<number | null>(null);

	const refresh = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get<ApiResponse<ClientWorkflow[]>>(`/workflow/client/${clientId}`);
			setClientWorkflows(res.data.data ?? []);
		} catch (err) {
			setError(extractErrorMessage(err, "Erro ao carregar workflows do cliente."));
		} finally {
			setLoading(false);
		}
	}, [clientId]);

	React.useEffect(() => {
		refresh();
	}, [refresh]);

	const onDelete = async () => {
		if (deleteId === null) return;
		try {
			await api.delete(`/workflow/client/${deleteId}`);
			setDeleteId(null);
			await refresh();
		} catch (err) {
			setError(extractErrorMessage(err, "Falha ao remover workflow."));
		}
	};

	return (
		<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">Workflows</h2>
					<p className="text-sm text-muted-foreground">
						Gerencie os workflows N8N vinculados a este cliente.
					</p>
				</div>
				<Button onClick={() => setOpen(true)}>
					<Plus className="h-4 w-4" />
					Adicionar Workflow
				</Button>
			</div>

			{error && <p className="mb-3 text-sm text-destructive">{error}</p>}

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nome</TableHead>
						<TableHead>Workflow ID</TableHead>
						<TableHead className="w-40">Adicionado em</TableHead>
						<TableHead className="w-12" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableEmpty colSpan={4}>Carregando…</TableEmpty>
					) : clientWorkflows.length === 0 ? (
						<TableEmpty colSpan={4}>Nenhum workflow vinculado.</TableEmpty>
					) : (
						clientWorkflows.map((cw) => (
							<TableRow key={cw.id}>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<Workflow className="h-4 w-4 text-muted-foreground shrink-0" />
										{cw.workflow_name || "—"}
									</div>
								</TableCell>
								<TableCell className="text-muted-foreground font-mono text-xs">
									{cw.workflow_id}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{formatDate(cw.created_at)}
								</TableCell>
								<TableCell>
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={() => setDeleteId(cw.id)}
										aria-label="Remover"
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			<AddWorkflowDialog
				open={open}
				onOpenChange={setOpen}
				clientId={clientId}
				existingWorkflowIds={clientWorkflows.map((cw) => cw.workflow_id)}
				onSaved={refresh}
			/>

			<ConfirmDialog
				open={deleteId !== null}
				onOpenChange={(o) => !o && setDeleteId(null)}
				title="Remover workflow?"
				description="O workflow será desvinculado deste cliente. Esta ação não poderá ser desfeita."
				destructive
				confirmLabel="Remover"
				onConfirm={onDelete}
			/>
		</div>
	);
}

interface AddWorkflowDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	clientId: number;
	existingWorkflowIds: string[];
	onSaved: () => Promise<void> | void;
}

function AddWorkflowDialog({
	open,
	onOpenChange,
	clientId,
	existingWorkflowIds,
	onSaved,
}: AddWorkflowDialogProps) {
	const [workflows, setWorkflows] = React.useState<WorkflowType[]>([]);
	const [loadingWorkflows, setLoadingWorkflows] = React.useState(false);
	const [selectedId, setSelectedId] = React.useState<string>("");
	const [serverError, setServerError] = React.useState<string | null>(null);
	const [saving, setSaving] = React.useState(false);

	React.useEffect(() => {
		if (!open) {
			setSelectedId("");
			setServerError(null);
			return;
		}
		setLoadingWorkflows(true);
		api
			.get<ApiResponse<WorkflowType[]>>("/workflow")
			.then((res) => setWorkflows(res.data.data ?? []))
			.catch((err) => setServerError(extractErrorMessage(err, "Erro ao carregar workflows.")))
			.finally(() => setLoadingWorkflows(false));
	}, [open]);

	const available = workflows.filter((w) => !existingWorkflowIds.includes(w.id));

	const handleSave = async () => {
		if (!selectedId) return;
		const workflow = workflows.find((w) => w.id === selectedId);
		if (!workflow) return;

		setSaving(true);
		setServerError(null);
		try {
			await api.post("/workflow/client", {
				clientId,
				workflowId: workflow.id,
				workflowName: workflow.name,
			});
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			setServerError(extractErrorMessage(err, "Falha ao adicionar workflow."));
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Adicionar Workflow</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{loadingWorkflows ? (
						<p className="text-sm text-muted-foreground">Carregando workflows…</p>
					) : available.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Nenhum workflow disponível para adicionar.
						</p>
					) : (
						<div className="space-y-1.5">
							<Select value={selectedId} onValueChange={setSelectedId}>
								<SelectTrigger>
									<SelectValue placeholder="Selecione um workflow" />
								</SelectTrigger>
								<SelectContent>
									{available.map((w) => (
										<SelectItem key={w.id} value={w.id}>
											{w.name || w.id}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{serverError && (
						<p className="text-sm text-destructive">{serverError}</p>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
						Cancelar
					</Button>
					<Button onClick={handleSave} disabled={saving || !selectedId || loadingWorkflows}>
						{saving ? "Salvando…" : "Adicionar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}