"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	Table,
	TableBody,
	TableCell,
	TableEmpty,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { ClientLeadView } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const kindBadge: Record<string, string> = {
	open: "bg-secondary text-foreground",
	won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	lost: "bg-red-500/10 text-red-600 dark:text-red-400",
};


interface LeadTableProps {
	leads: ClientLeadView[];
	loading?: boolean;
	showClient?: boolean;
	basePath?: string;
}

export function LeadTable({
	leads,
	loading,
	showClient,
	basePath = "/leads",
}: LeadTableProps) {
	const router = useRouter();
	const cols = showClient ? 7 : 6;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Nome</TableHead>
					<TableHead>WhatsApp</TableHead>
					<TableHead>Instagram</TableHead>
					{showClient && <TableHead>Cliente</TableHead>}
					<TableHead className="">Status</TableHead>
					<TableHead className="w-32">Atendimento</TableHead>
					<TableHead className="w-40">Atualizado</TableHead>
				</TableRow>
			</TableHeader>
			
			<TableBody>
				{loading ? (
					<TableEmpty colSpan={cols}>Carregando…</TableEmpty>
				) : leads.length === 0 ? (
					<TableEmpty colSpan={cols}>Nenhum lead encontrado.</TableEmpty>
				) : (
					leads.map((lead) => (
						<TableRow
							key={lead.lead_id}
							onClick={() => router.push(`${basePath}/${lead.lead_id}`)}
							className="cursor-pointer"
						>
							<TableCell className="font-medium"> {lead.lead_name || "—"} </TableCell>
							<TableCell className="text-muted-foreground"> {lead.lead_whatsapp_number || "—"} </TableCell>
							<TableCell className="text-muted-foreground"> {lead.lead_instagram_username || "—"} </TableCell>
							{showClient && (
								<TableCell> {lead.client_name || `#${lead.client_id}`} </TableCell>
							)}
							<TableCell>
								<span className={`rounded-md px-2 py-0.5 text-xs ${kindBadge[lead.lead_stage_kind ?? "open"]}`}>
									{lead.lead_stage_name ?? "—"}
								</span>
							</TableCell>
							<TableCell>
								{Number(lead.lead_human_handover) === 1 ? (
									<span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">Humano</span>
								) : (
									<span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">IA</span>
								)}
							</TableCell>
							<TableCell className="text-muted-foreground"> {formatDate(lead.lead_updated_at)} </TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}
