"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/signin-form";
import { SignUpForm } from "@/components/auth/signup-form";
import { ResetForm } from "@/components/auth/reset-form";

type Mode = "signin" | "signup" | "reset";

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>("signin");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const readHash = () => {
      const h = window.location.hash;
      if (h === "#signup") setMode("signup");
      else if (h === "#reset") setMode("reset");
      else setMode("signin");
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  function updateHash(next: Mode) {
    setMode(next);
    if (typeof window !== "undefined") {
      const nextHash = next === "signin" ? "" : `#${next}`;
      history.replaceState(null, "", `${window.location.pathname}${nextHash}`);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/70 bg-card/80 shadow-elevation-lg backdrop-blur">
      <CardContent className="pt-6">
        {mode === "reset" ? (
          <ResetForm onBack={() => updateHash("signin")} />
        ) : (
          <Tabs value={mode} onValueChange={(v) => updateHash(v as Mode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <SignInForm onForgotPassword={() => updateHash("reset")} />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
