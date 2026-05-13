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

const statusLabel: Record<string, string> = {
	novo: "Novo",
	em_atendimento: "Em atendimento",
	fechado: "Fechado",
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
								<span className="rounded-md bg-secondary px-2 py-0.5 text-xs">
									{statusLabel[lead.lead_status ?? ""] ?? lead.lead_status ?? "—"}
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
