"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { LeadTable } from "@/components/shared/lead-table";
import { ClientLeadView, ApiResponse } from "@/lib/types";
import { api } from "@/lib/api";

export default function LeadsPage() {
	const [items, setItems] = React.useState<ClientLeadView[]>([]);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			const res = await api.get<ApiResponse<ClientLeadView[]>>("/leads");
			if (!cancelled) {
				setItems(res.data.data);
				setLoading(false);
			}
		})();
		return () => { cancelled = true; };
	}, []);

	return (
		<div>
			<PageHeader
				title="Leads"
				description="Acompanhe os leads capturados pela automação."
				actions={
					<Button asChild>
						<Link href="/leads/novo">
							<Plus className="h-4 w-4" />
							Novo Lead
						</Link>
					</Button>
				}
			/>
			<LeadTable leads={items} loading={loading} basePath="/leads" />
		</div>
	);
}
