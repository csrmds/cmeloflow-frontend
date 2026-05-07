"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/stores/user-store";

export function Header() {
  const router = useRouter();
  const payload = useUserStore((s) => s.payload);
  const clear = useUserStore((s) => s.clear);

  const handleLogout = () => {
    clear();
    router.push("/login");
  };

  const userId = payload?.user_id ?? "—";
  const role = payload?.user_role ?? "";
  const roleLabel =
    role === "admin" ? "Administrador" : role === "service" ? "Serviço" : "Cliente";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
      <div className="text-sm text-muted-foreground">
        {payload ? (
          <span>
            <span className="font-medium text-foreground">Usuário #{userId}</span>{" "}
            <span className="text-xs">· {roleLabel}</span>
          </span>
        ) : (
          <span>Carregando…</span>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </header>
  );
}
