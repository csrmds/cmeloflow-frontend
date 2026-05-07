"use client";

import * as React from "react";
import { Sidebar, MainContentWrapper } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { AuthGuard } from "@/components/shared/auth-guard";
import { SidebarProvider } from "@/components/shared/sidebar-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <MainContentWrapper>
            <Header />
            <main className="p-6">{children}</main>
          </MainContentWrapper>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
