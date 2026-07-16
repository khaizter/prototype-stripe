import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const learningPath = [
  {
    title: "Supabase setup",
    description:
      "Create a project, run the SQL migration, and browse customers, subscriptions, orders, and webhook_events in the dashboard.",
  },
  {
    title: "Stripe keys + CLI",
    description:
      "Add API keys to .env.local, then use `stripe listen --forward-to localhost:<PORT>/api/webhooks/stripe` while developing (PORT from .env.local, default 3000).",
  },
  {
    title: "Auth (optional)",
    description:
      "Wire up Supabase Auth when you are ready. The callback route and middleware are already scaffolded.",
  },
  {
    title: "Checkout & subscriptions",
    description:
      "Build checkout sessions and subscription flows one piece at a time. Webhook handlers have TODO stubs waiting for you.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Learning sandbox</p>
            <h1 className="text-lg font-semibold">prototype-stripe</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              nativeButton={false}
              render={<a href="/admin" />}
            >
              Admin
            </Button>
            <Badge variant="secondary">Next.js</Badge>
            <Badge variant="secondary">Stripe</Badge>
            <Badge variant="secondary">Supabase</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
        <section className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight">
            Learn Stripe, piece by piece
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            A minimal starter for experimenting with Stripe APIs. Database tables
            are ready in Supabase so you can see real rows as you build checkout,
            subscriptions, and webhooks.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {learningPath.map((step) => (
            <Card key={step.title}>
              <CardHeader>
                <CardTitle className="text-base">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Starter files</CardTitle>
            <CardDescription>
              Key paths to explore as you go
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-sm text-muted-foreground">
            <p>lib/stripe.ts</p>
            <p>app/api/webhooks/stripe/route.ts</p>
            <p>lib/supabase/</p>
            <p>supabase/migrations/</p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            nativeButton={false}
            render={
              <a
                href="https://dashboard.stripe.com/test/apikeys"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Stripe Dashboard
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Supabase Dashboard
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href="https://docs.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Stripe Docs
          </Button>
        </div>
      </main>
    </div>
  );
}
