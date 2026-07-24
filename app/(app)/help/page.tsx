import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  LifeBuoy,
  MessageSquare,
  Rocket,
  ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Help — Zivvy",
  description: "Guides, docs, and ways to get support inside Zivvy."
};

const LINKS = [
  {
    href: "/support/help-center",
    title: "Help center",
    description: "Billing, security, accounts, and troubleshooting.",
    icon: LifeBuoy
  },
  {
    href: "/support/docs",
    title: "Documentation",
    description: "Product docs and how-to guides.",
    icon: BookOpen
  },
  {
    href: "/support/changelog",
    title: "Changelog",
    description: "What shipped recently.",
    icon: ScrollText
  },
  {
    href: "/support/roadmap",
    title: "Roadmap",
    description: "What’s next on the product plan.",
    icon: Rocket
  },
  {
    href: "/support/tickets",
    title: "Support tickets",
    description: "Open or track issues for your workspace.",
    icon: MessageSquare
  }
] as const;

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Help
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find answers, docs, and support for your Zivvy workspace.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map(({ href, title, description, icon: Icon }) => (
          <Card key={href} className="border-border/70">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-4" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </div>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link href={href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
