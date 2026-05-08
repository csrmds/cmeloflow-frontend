"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { LeadForm } from "@/components/shared/lead-form";
import { Lead } from "@/lib/types";
import { api } from "@/lib/api";
//import { getLead, type NormalizedLead } from "@/lib/services/leads";

export default function EditarLeadPage() {
	const params = useParams<{ id: string }>();
	const id = Number(params.id);
	const [lead, setLead] = React.useState<Lead | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		console.log("useEffect lead: ", lead)
		let cancelled = false;
		(async () => {
			setLoading(true);
			const res = await api.get<Lead[]>(`/leads/${id}`);
			console.log("lead get res: ", res.data)
			const found = res.data.find((l) => l.id === id) ?? null;
			if (!cancelled) {
				setLead(found);
				setLoading(false);
			}
		})();
		return () => { cancelled = true; };
	}, [id]);

	return (
		<div className="max-w-3xl">
			<PageHeader title="Editar Lead" description="Atualize as informações do lead." />
			{loading ? ( <p className="text-sm text-muted-foreground">Carregando…</p>) 
			: lead ? ( <LeadForm lead={lead} /> ) 
			: ( <p className="text-sm text-destructive">Lead não encontrado.</p> )}
		</div>
	);
}
