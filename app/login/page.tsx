import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/site/logo";
import { AuthPanel } from "@/components/auth/auth-panel";
import { fetchBootinfo } from "@/lib/boot-server";

export const metadata: Metadata = {
  title: "Sign In to Your Cloud ERP Workspace — Zivvy",
  description: "Sign in to your Zivvy cloud ERP workspace or create a free account. Access sales, stock, accounting, HR and manufacturing from any browser."
};

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const boot = await fetchBootinfo();
  if (boot.logged_in) {
    // Preserve any pending plan / billing selection so the dashboard can hand
    // the user off to Polar checkout instead of silently swallowing the params.
    const params = (await searchParams) ?? {};
    const plan = pickParam(params.plan);
    const billing = pickParam(params.billing);
    if (plan === "pro" || plan === "business") {
      const query = new URLSearchParams({ plan });
      if (billing === "annual" || billing === "monthly") {
        query.set("billing", billing);
      }
      redirect(`/dashboard?${query.toString()}`);
    }
    redirect("/dashboard");
  }
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <h1 className="sr-only">Sign in to Zivvy</h1>
      {/* Brand panel */}
      <div
        className="relative hidden overflow-hidden text-primary-foreground lg:block"
        style={{
          background:
            "linear-gradient(to bottom, var(--primary-light), var(--primary-dark) 70%)"
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 25% 12%, rgba(255,255,255,0.10), transparent 65%)"
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="inline-flex">
            <Logo className="[&>div]:bg-white/15 [&>div]:text-white [&_span]:text-white" />
          </Link>
          <div className="max-w-md">
            <h2 className="font-display text-4xl leading-[1.1] tracking-tight text-primary-foreground">
              Business software that finally feels made for you.
            </h2>
            <p className="mt-5 text-primary-foreground/75">
              Sales, stock, accounting, HR, and manufacturing in one product.
            </p>
            <ul className="mt-8 space-y-2 text-sm text-primary-foreground/70">
              <li>· 1 seat on Free, forever</li>
              <li>· No credit card required</li>
              <li>· Data in India, EU, or US — your choice</li>
            </ul>
          </div>
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Zivvy · Business software that works
          </p>
        </div>
      </div>

      {/* Auth panel */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between px-6 py-6 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <AuthPanel />
        </div>
        <footer className="px-6 pb-6 text-center text-xs text-muted-foreground">
          Trouble signing in?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact us
          </Link>
        </footer>
      </div>
    </div>
  );
}
