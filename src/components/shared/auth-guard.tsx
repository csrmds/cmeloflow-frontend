"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/user-store";
import type { UserRole } from "@/lib/types";

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: UserRole | UserRole[];
}

export function AuthGuard({ children, requireRole }: AuthGuardProps) {
  const router = useRouter();
  const { hydrated, payload, hydrate } = useUserStore();

  React.useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!payload) {
      router.replace("/login");
      return;
    }
    if (requireRole) {
      const allowed = Array.isArray(requireRole) ? requireRole : [requireRole];
      if (!allowed.includes(payload.user_role)) {
        router.replace("/dashboard");
      }
    }
  }, [hydrated, payload, requireRole, router]);

  if (!hydrated || !payload) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }

  if (requireRole) {
    const allowed = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!allowed.includes(payload.user_role)) {
      return null;
    }
  }

  return <>{children}</>;
}
