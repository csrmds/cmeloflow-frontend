"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader as Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { api, extractErrorMessage } from "@/lib/api";
import type { NormalizedLead } from "@/lib/services/leads";

const schema = z.object({
  name: z.string().optional(),
  whatsapp_number: z.string().optional(),
  instagram_username: z.string().optional(),
  instagram_scoped_userid: z.string().optional(),
  source: z.enum(["whatsapp", "instagram", "comment"]),
  status: z.enum(["novo", "em_atendimento", "fechado"]),
  human_handover: z.boolean(),
  first_message: z.string().optional(),
  last_message: z.string().optional(),
  client_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface LeadFormProps {
  lead?: NormalizedLead;
  redirectAfter?: string;
  showClientField?: boolean;
}

export function LeadForm({
  lead,
  redirectAfter = "/leads",
  showClientField = false,
}: LeadFormProps) {
  const router = useRouter();
  const isEdit = Boolean(lead);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: lead?.name ?? "",
      whatsapp_number: lead?.whatsapp_number ?? "",
      instagram_username: lead?.instagram_username ?? "",
      instagram_scoped_userid: lead?.instagram_scoped_userid ?? "",
      source: ((lead?.source as "whatsapp" | "instagram" | "comment") ??
        "whatsapp"),
      status: ((lead?.status as "novo" | "em_atendimento" | "fechado") ?? "novo"),
      human_handover: Boolean(lead?.human_handover),
      first_message: lead?.first_message ?? "",
      last_message: lead?.last_message ?? "",
      client_id: lead?.client_id != null ? String(lead.client_id) : "",
    },
  });

  const source = watch("source");
  const status = watch("status");
  const handover = watch("human_handover");

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const payload = {
      ...values,
      client_id: values.client_id ? Number(values.client_id) : undefined,
    };
    try {
      // TODO: backend ainda não expõe POST/PUT/DELETE /leads autenticados.
      // Estes calls funcionarão quando os endpoints forem registrados.
      if (isEdit && lead) {
        await api.put(`/leads/${lead.id}`, payload).catch(() => {
          throw new Error(
            "Endpoint PUT /leads/:id não implementado no backend (placeholder)."
          );
        });
      } else {
        await api.post(`/leads`, payload).catch(() => {
          throw new Error(
            "Endpoint POST /leads autenticado não implementado no backend (placeholder)."
          );
        });
      }
      router.push(redirectAfter);
      router.refresh();
    } catch (err) {
      setServerError(extractErrorMessage(err, "Falha ao salvar."));
    }
  };

  const onDelete = async () => {
    if (!lead) return;
    try {
      await api.delete(`/leads/${lead.id}`);
      router.push(redirectAfter);
      router.refresh();
    } catch (err) {
      setServerError(extractErrorMessage(err, "Falha ao excluir."));
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {showClientField && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="client_id">Cliente (ID)</Label>
              <Input
                id="client_id"
                type="number"
                {...register("client_id")}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp_number">WhatsApp</Label>
            <Input
              id="whatsapp_number"
              placeholder="5527999999999"
              {...register("whatsapp_number")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instagram_username">Instagram Username</Label>
            <Input id="instagram_username" {...register("instagram_username")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instagram_scoped_userid">
              Instagram Scoped User ID
            </Label>
            <Input
              id="instagram_scoped_userid"
              {...register("instagram_scoped_userid")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Origem</Label>
            <Select
              value={source}
              onValueChange={(v) =>
                setValue("source", v as "whatsapp" | "instagram" | "comment")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="comment">Comentário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) =>
                setValue(
                  "status",
                  v as "novo" | "em_atendimento" | "fechado"
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="em_atendimento">Em atendimento</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch
              id="human_handover"
              checked={handover}
              onCheckedChange={(v) => setValue("human_handover", v)}
            />
            <Label htmlFor="human_handover" className="cursor-pointer">
              Atendimento humano
            </Label>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="first_message">Primeira mensagem</Label>
            <Textarea
              id="first_message"
              rows={3}
              readOnly={isEdit}
              {...register("first_message")}
            />
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                Somente leitura — registrada quando o lead foi criado.
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="last_message">Última mensagem</Label>
            <Textarea id="last_message" rows={3} {...register("last_message")} />
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir lead?"
        description="Esta ação é permanente e não poderá ser desfeita."
        confirmLabel="Excluir"
        destructive
        onConfirm={onDelete}
      />
    </>
  );
}
