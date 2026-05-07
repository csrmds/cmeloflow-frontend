import Link from "next/link";
import {
  ArrowRight,
  Bot,
  AtSign as Instagram,
  MessageCircle,
  PanelsTopLeft,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <PanelsTopLeft className="h-4 w-4" />
            </div>
            CMeloFlow
          </Link>
          <Button asChild size="sm">
            <Link href="/login">
              Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background" />
          <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Atendimento com IA
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Automatize seu atendimento{" "}
              <span className="text-primary">sem perder leads</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              Capture leads pelo Instagram, conduza conversas no WhatsApp com
              inteligência artificial e libere sua equipe para o que realmente
              importa.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/login">
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#como-funciona">Como funciona</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Como funciona
            </h2>
            <p className="mt-3 text-muted-foreground">
              Um fluxo simples, do primeiro toque ao fechamento da venda.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Instagram,
                title: "Instagram",
                description:
                  "Capturamos comentários e DMs do seu Instagram automaticamente, qualificando o lead na hora.",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp",
                description:
                  "O lead recebe uma mensagem personalizada no WhatsApp e a conversa começa em segundos.",
              },
              {
                icon: Bot,
                title: "IA",
                description:
                  "Nossa IA conduz a conversa, apresenta produtos e aciona o atendimento humano quando necessário.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                Por que CMeloFlow
              </h2>
              <p className="mt-3 text-muted-foreground">
                Mais leads, menos esforço, decisões orientadas por dados.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Zap,
                  title: "Resposta instantânea",
                  description:
                    "Reduza o tempo de resposta a zero — esteja disponível 24/7 sem esforço.",
                },
                {
                  icon: TrendingUp,
                  title: "Mais conversões",
                  description:
                    "Leads bem qualificados chegam ao time comercial prontos para fechar.",
                },
                {
                  icon: Sparkles,
                  title: "Tudo integrado",
                  description:
                    "Instagram, WhatsApp, IA e CRM em um só lugar — gerencie tudo do dashboard.",
                },
              ].map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Pronto para escalar seu atendimento?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Acesse sua conta e comece a capturar leads automaticamente.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/login">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CMeloFlow. Todos os direitos reservados.
      </footer>
    </div>
  );
}
