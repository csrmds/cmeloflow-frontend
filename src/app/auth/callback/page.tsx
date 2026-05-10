"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/lib/stores/user-store";

export default function AuthCallbackPage() {
  return (
    <React.Suspense fallback={null}>
      <CallbackHandler />
    </React.Suspense>
  );
}

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const setToken = useUserStore((s) => s.setToken);

  React.useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      router.replace("/login?error=oauth");
      return;
    }

    setToken(token);
    router.replace("/dashboard");
  }, [params, router, setToken]);

  return (
    <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
      Autenticando…
    </div>
  );
}
