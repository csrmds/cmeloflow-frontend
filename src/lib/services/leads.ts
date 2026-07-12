import { api } from "@/lib/api";
import type { Lead } from "@/lib/types";

// TODO: Backend não expõe GET /leads no routes/leadRoutes.js (apenas o controller existe).
// Quando o endpoint for adicionado no backend, este serviço já está alinhado a ele.
// Enquanto isso, em caso de 404 retornamos um array vazio para não bloquear a UI.

interface NormalizedLead {
	id: number;
	client_id: number;
	client_name?: string;
	name: string | null;
	whatsapp_number: string | null;
	instagram_username: string | null;
	instagram_scoped_userid: string | null;
	status: string | null;
	human_handover: number;
	source: string | null;
	first_message: string | null;
	last_message: string | null;
	notes: string | null;
	created_at: string | null;
	updated_at: string | null;
}

function normalize(row: Lead): NormalizedLead {
	return {
		id: (row.id ?? row.id ?? 0) as number,
		client_id: row.client_id,
		//client_name: row.client_name,
		name: (row.name ?? null) as string | null,
		whatsapp_number: (row.whatsapp_number ?? row.whatsapp_number ?? null) as
			| string
			| null,
		instagram_username: (row.instagram_username ??
			row.instagram_username ??
			null) as string | null,
		instagram_scoped_userid: (row.instagram_scoped_userid ??
			row.instagram_scoped_userid ??
			null) as string | null,
		status: (row.status ?? row.status ?? null) as string | null,
		human_handover: Number(row.human_handover ?? row.human_handover ?? 0),
		source: row.source ?? null,
		first_message: row.first_message ?? null,
		last_message: row.last_message ?? null,
		notes: row.notes ?? null,
		created_at: row.created_at ?? null,
		updated_at: row.updated_at ?? null,
	};
}

export async function listLeads(): Promise<NormalizedLead[]> {
	try {
		const res = await api.get<Lead[]>("/leads");
		return (res.data || []).map(normalize);
	} catch {
		// Endpoint pode não estar registrado no backend ainda
		return [];
	}
}

export async function getLead(id: number): Promise<NormalizedLead | null> {
	const all = await listLeads();
	return all.find((l) => l.id === id) ?? null;
}

export type { NormalizedLead };
