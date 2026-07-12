"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { api, extractErrorMessage } from "@/lib/api";
import { toLocalISOString } from "@/lib/utils";

const schema = z
	.object({
		summary: z.string().min(1, "Título obrigatório"),
		date: z.string().min(1, "Data obrigatória"),
		start_time: z.string().min(1, "Horário de início obrigatório"),
		end_time: z.string().min(1, "Horário de fim obrigatório"),
		description: z.string().optional(),
		attendeeEmail: z.string().email("E-mail inválido").or(z.literal("")).optional(),
	})
	.refine((v) => v.end_time > v.start_time, {
		message: "Horário de fim deve ser depois do início",
		path: ["end_time"],
	});

type FormValues = z.infer<typeof schema>;

interface EventFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => Promise<void> | void;
}

export function EventFormDialog({ open, onOpenChange, onSaved }: EventFormDialogProps) {
	const [serverError, setServerError] = React.useState<string | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			summary: "",
			date: "",
			start_time: "",
			end_time: "",
			description: "",
			attendeeEmail: "",
		},
	});

	React.useEffect(() => {
		if (!open) return;
		reset({
			summary: "",
			date: "",
			start_time: "",
			end_time: "",
			description: "",
			attendeeEmail: "",
		});
		setServerError(null);
	}, [open, reset]);

	const onSubmit = async (values: FormValues) => {
		setServerError(null);
		const payload = {
			summary: values.summary,
			description: values.description || undefined,
			start: toLocalISOString(values.date, values.start_time),
			end: toLocalISOString(values.date, values.end_time),
			attendeeEmail: values.attendeeEmail || undefined,
		};
		try {
			await api.post("/calendar/events", payload);
			onOpenChange(false);
			await onSaved();
		} catch (err) {
			setServerError(extractErrorMessage(err, "Falha ao criar evento."));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Novo Evento</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="summary">Título</Label>
						<Input id="summary" placeholder="Ex: Reunião com cliente" {...register("summary")} />
						{errors.summary && (
							<p className="text-xs text-destructive">{errors.summary.message}</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="date">Data</Label>
						<Input id="date" type="date" {...register("date")} />
						{errors.date && (
							<p className="text-xs text-destructive">{errors.date.message}</p>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<Label htmlFor="start_time">Início</Label>
							<Input id="start_time" type="time" {...register("start_time")} />
							{errors.start_time && (
								<p className="text-xs text-destructive">{errors.start_time.message}</p>
							)}
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="end_time">Fim</Label>
							<Input id="end_time" type="time" {...register("end_time")} />
							{errors.end_time && (
								<p className="text-xs text-destructive">{errors.end_time.message}</p>
							)}
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="attendeeEmail">E-mail do Lead (convidado)</Label>
						<Input id="attendeeEmail" type="email" placeholder="lead@email.com" {...register("attendeeEmail")} />
						{errors.attendeeEmail && (
							<p className="text-xs text-destructive">{errors.attendeeEmail.message}</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="description">Descrição</Label>
						<Textarea id="description" rows={3} {...register("description")} />
					</div>

					{serverError && <p className="text-sm text-destructive">{serverError}</p>}

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancelar
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
							Salvar
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}