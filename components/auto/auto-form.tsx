import Link from "next/link";
import { AlertTriangle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AutoFormClient } from "@/components/auto/auto-form-client";
import { getDoc, getDoctypeMeta, groupFieldsForForm } from "@/lib/frappe-meta";

interface Props {
  doctype: string;
  name: string;                  // "new" for create
  basePath: string;
  title: string;
}

function EmptyState({
  title,
  basePath,
  reason
}: {
  title: string;
  basePath: string;
  reason: "auth" | "not-found";
}) {
  if (reason === "auth") {
    return (
      <Card className="border-border/70 bg-card">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <LogIn className="size-5" />
          </div>
          <p className="mt-3 font-display text-lg">Sign in to open this record</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Records live in your tenant. Sign in to view or edit {title.toLowerCase()}.
          </p>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline">
              <Link href={basePath}>Back to list</Link>
            </Button>
            <Button asChild variant="polished">
              <Link href="/login">
                <LogIn />
                Sign in
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-border/70 bg-card">
      <CardContent className="flex flex-col items-center py-16 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <AlertTriangle className="size-5 text-chart-2" />
        </div>
        <p className="mt-3 font-display text-lg">Record not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={basePath}>Back to {title.toLowerCase()}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export async function AutoForm({ doctype, name, basePath, title }: Props) {
  const meta = await getDoctypeMeta(doctype);
  if (!meta) {
    return <EmptyState title={title} basePath={basePath} reason="auth" />;
  }

  const isNew = name === "new";
  const groups = groupFieldsForForm(meta, { isNew });
  const doc = isNew
    ? ({ __islocal: 1, doctype } as Record<string, unknown>)
    : await getDoc(doctype, name);

  if (!doc && !isNew) {
    return <EmptyState title={title} basePath={basePath} reason="not-found" />;
  }

  return (
    <AutoFormClient
      meta={meta}
      groups={groups}
      initialDoc={(doc ?? { doctype }) as Record<string, unknown>}
      basePath={basePath}
      title={title}
    />
  );
}
