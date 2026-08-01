import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
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

interface HelpLink {
  href: string;
  title: string;
  description: string;
  icon: typeof LifeBuoy;
  external?: boolean;
}

const LINKS: HelpLink[] = [
  {
    href: "/support/help-center",
    title: "Help center",
    description: "Billing, security, accounts, and troubleshooting.",
    icon: LifeBuoy,
    external: true
  },
  {
    href: "/support/docs",
    title: "Documentation",
    description: "Product docs and how-to guides.",
    icon: BookOpen,
    external: true
  },
  {
    href: "/support/changelog",
    title: "Changelog",
    description: "What shipped recently.",
    icon: ScrollText,
    external: true
  },
  {
    href: "/support/roadmap",
    title: "Roadmap",
    description: "What's next on the product plan.",
    icon: Rocket,
    external: true
  },
  {
    href: "/service/tickets",
    title: "Support tickets",
    description: "Open or track issues for your workspace.",
    icon: MessageSquare
  }
];

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
        {LINKS.map(({ href, title, description, icon: Icon, external }) => (
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
                {external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    Open
                    <ExternalLink className="ml-1.5 size-3 text-muted-foreground" />
                  </a>
                ) : (
                  <Link href={href}>Open</Link>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
