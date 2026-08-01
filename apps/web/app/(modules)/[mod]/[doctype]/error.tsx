"use client";

import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ModuleRecordsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ mod?: string }>();
  const moduleHref = params.mod ? `/${params.mod}` : "/apps";

  return (
    <div className="mx-auto grid min-h-[55vh] w-full max-w-3xl place-items-center px-4 py-12">
      <div role="alert" className="w-full rounded-xl border border-status-danger-ring bg-status-danger-bg/45 p-6 sm:p-8">
        <span className="grid size-11 place-items-center rounded-full bg-status-danger-bg text-status-danger-fg">
          <AlertTriangle className="size-5" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">This workflow could not be loaded</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Your work is safe. Retry the request, or return to the module overview to choose another action.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" variant="polished" onClick={reset}>
            <RotateCcw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href={moduleHref}>
              <ArrowLeft className="size-4" />
              Module overview
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
