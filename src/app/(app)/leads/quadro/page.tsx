"use client";

import * as React from "react";
import Link from "next/link";
import { List, Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { StageManager } from "@/components/shared/stage-manager";
import { api, extractErrorMessage } from "@/lib/api";
import type { ApiResponse, BoardData, BoardStage } from "@/lib/types";

export default function LeadsBoardPage() {
	const [stages, setStages] = React.useState<BoardStage[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [managerOpen, setManagerOpen] = React.useState(false);

	const load = React.useCallback(async () => {
		try {
			const res = await api.get<ApiResponse<BoardData>>("/leads/board");
			setStages(res.data.data.stages);
			setError(null);
		} catch (err) {
			setError(extractErrorMessage(err, "Falha ao carregar o quadro."));
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		void load();
	}, [load]);

	return (
		<div>
			<PageHeader
				title="Quadro de leads"
				description="Arraste os cards para classificar seus leads."
				actions={
					<>
						<Button variant="outline" asChild>
							<Link href="/leads">
								<List className="h-4 w-4" />
								Lista
							</Link>
						</Button>
						<Button variant="outline" onClick={() => setManagerOpen(true)}>
							<Settings2 className="h-4 w-4" />
							Raias
						</Button>
						<Button asChild>
							<Link href="/leads/novo">
								<Plus className="h-4 w-4" />
								Novo Lead
							</Link>
						</Button>
					</>
				}
			/>

			{loading ? (
				<p className="text-sm text-muted-foreground">Carregando…</p>
			) : error ? (
				<p className="text-sm text-destructive">{error}</p>
			) : (
				<KanbanBoard stages={stages} onReload={load} />
			)}

			<StageManager
				open={managerOpen}
				onOpenChange={setManagerOpen}
				stages={stages}
				onChanged={load}
			/>
		</div>
	);
}
