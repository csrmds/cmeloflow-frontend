"use client";

import * as React from "react";
import Link from "next/link";
import { List, Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { StageManager } from "@/components/shared/stage-manager";
import { api, extractErrorMessage } from "@/lib/api";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { ApiResponse, BoardData, BoardPeriod, BoardStage } from "@/lib/types";

const PERIOD_KEY = "cmeloflow_board_period";
const PERIOD_LABEL: Record<BoardPeriod, string> = {
	"7": "Últimos 7 dias",
	"30": "Últimos 30 dias",
	"90": "Últimos 90 dias",
	all: "Todos",
};

function readStoredPeriod(): BoardPeriod {
	try {
		const v = window.localStorage.getItem(PERIOD_KEY);
		if (v === "7" || v === "30" || v === "90" || v === "all") return v;
	} catch {
		// localStorage indisponível: usa o padrão
	}
	return "30";
}

export default function LeadsBoardPage() {
	const [stages, setStages] = React.useState<BoardStage[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [managerOpen, setManagerOpen] = React.useState(false);
	const [period, setPeriod] = React.useState<BoardPeriod>("30");
	const [periodReady, setPeriodReady] = React.useState(false);

	React.useEffect(() => {
		setPeriod(readStoredPeriod());
		setPeriodReady(true);
	}, []);

	const load = React.useCallback(async () => {
		try {
			const res = await api.get<ApiResponse<BoardData>>("/leads/board", {
				params: { days: period },
			});
			setStages(res.data.data.stages);
			setError(null);
		} catch (err) {
			setError(extractErrorMessage(err, "Falha ao carregar o quadro."));
		} finally {
			setLoading(false);
		}
	}, [period]);

	React.useEffect(() => {
		if (periodReady) void load();
	}, [load, periodReady]);

	const changePeriod = (value: string) => {
		setPeriod(value as BoardPeriod);
		try {
			window.localStorage.setItem(PERIOD_KEY, value);
		} catch {
			// sem persistência
		}
	};

	return (
		<div>
			<PageHeader
				title="Quadro de leads"
				description="Arraste os cards para classificar seus leads."
				actions={
					<>
						<Select value={period} onValueChange={changePeriod}>
							<SelectTrigger className="w-44" title="Período das raias Ganho e Perdido">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{(Object.keys(PERIOD_LABEL) as BoardPeriod[]).map((p) => (
									<SelectItem key={p} value={p}>
										{PERIOD_LABEL[p]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
