"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/lib/stores/user-store";

interface DashCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

function DashCard({ href, title, description, icon: Icon }: DashCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
        <CardContent className="flex items-start justify-between gap-4 p-6">
          <div className="flex flex-col gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground transition-all" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const payload = useUserStore((s) => s.payload);
  const isAdmin = payload?.user_role === "admin";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted-foreground mb-1">
          Bem-vindo de volta
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Olá, usuário #{payload?.user_id ?? "—"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          O CMeloFlow automatiza seu atendimento via WhatsApp e Instagram com
          inteligência artificial. Capture leads, organize seus produtos e
          escale o atendimento sem precisar aumentar a equipe.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isAdmin ? (
          <>
            <DashCard
              href="/admin/clientes"
              title="Clientes"
              description="Gerencie todos os clientes da plataforma."
              icon={Users}
            />
            <DashCard
              href="/admin/leads"
              title="Leads"
              description="Visualize todos os leads de todos os clientes."
              icon={Sparkles}
            />
            <DashCard
              href="/admin/produtos"
              title="Produtos"
              description="Visualize todos os produtos cadastrados."
              icon={Package}
            />
          </>
        ) : (
          <>
            <DashCard
              href="/produtos"
              title="Meus Produtos"
              description="Cadastre e organize seus produtos e serviços."
              icon={Package}
            />
            <DashCard
              href="/leads"
              title="Meus Leads"
              description="Acompanhe os leads capturados pela automação."
              icon={Sparkles}
            />
          </>
        )}
      </section>
    </div>
  );
}
