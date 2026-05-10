"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PanelsTopLeft,
  CircleAlert as AlertCircle,
  Loader as Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, extractErrorMessage } from "@/lib/api";
import { useUserStore } from "@/lib/stores/user-store";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type FormValues = z.infer<typeof schema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
          Carregando…
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setToken = useUserStore((s) => s.setToken);
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    console.log("useEffect API_URL: ", API_URL)
    if (params.get("error") === "oauth") {
      setServerError("Falha na autenticação com Google. Tente novamente.");
    }
  }, [params]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await api.post<{ token: string }>("/auth/login", values);
      setToken(res.data.token);
      const target = params.get("from") || "/dashboard";
      router.push(target);
    } catch (err) {
      setServerError(extractErrorMessage(err, "Falha ao autenticar."));
    }
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-br from-background via-background to-accent/40">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <PanelsTopLeft className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">CMeloFlow</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acesse sua conta para gerenciar seus leads e produtos.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          {/* Botão Google */}
          <a
            href={`${API_URL}/auth/google`}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Entrar com Google
          </a>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            ou
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Formulário email/senha */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← Voltar para o site
          </Link>
        </p>
      </div>
    </main>
  );
}
