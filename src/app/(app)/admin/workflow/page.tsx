"use client";

import * as React from "react";
//import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import {
	Table,
	TableBody,
	TableCell,
	TableEmpty,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
//import { AuthGuard } from "@/components/shared/auth-guard";
import { api, extractErrorMessage } from "@/lib/api";
import { Workflow, TagWorkflow, ApiResponse } from "@/lib/types"
import { formatDate } from "@/lib/utils";



export default function WorkflowPage() {
	//const router = useRouter()
	const [items, setItems] = React.useState<Workflow[]>([])
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)


	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true)
			try {
				const res = await api.get<ApiResponse<Workflow[]>>("/workflow")
				if (!cancelled) setItems(res.data.data);
			} catch (err) {
				if (!cancelled) setError(extractErrorMessage(err, "Erro ao listar workflows."));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})()
		return () => { cancelled = true }
	}, [])

	return (
		<div>
			<PageHeader
				title="Workflows"
				description="Lista de Workflows"
			/>

			{error && <p className="mb-4 text-sm text-destructive">{error}</p>}

			<Table>
				
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>Nome</TableHead>
						<TableHead>Tags</TableHead>
						<TableHead>Atualizado</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{loading ? ( <TableEmpty colSpan={4}>Carregando</TableEmpty> ) 
					: items.length === 0 ? ( <TableEmpty colSpan={4}>Nenhum workflow encontrado.</TableEmpty> )
					: items.map((workflow) => (
						<TableRow key={workflow.id} className="cursor-pointer">
							<TableCell className="font-medium">{workflow.id}</TableCell>
							<TableCell className="font-medium">{workflow.name}</TableCell>
							<TableCell className="font-medium flex flex-wrap gap-1">
								{Array.isArray(workflow.tags)
									? (workflow.tags as TagWorkflow[]).map((tag) => (
										<span className="rounded-md bg-secondary px-2 py-0.5 text-xs" key={tag.id}>{tag.name}</span>
									)) : "-" }
							</TableCell>
							<TableCell className="font-medium">{ formatDate(workflow.updatedAt) }</TableCell>
						</TableRow>
					)) 
					}
				</TableBody>

			</Table>
			
		</div>
	)


}


