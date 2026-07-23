"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/signin-form";
import { SignUpForm } from "@/components/auth/signup-form";

export function AuthPanel() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#signup") setTab("signup");
    const onHash = () => {
      setTab(window.location.hash === "#signup" ? "signup" : "signin");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function onTabChange(next: string) {
    const t = next as "signin" | "signup";
    setTab(t);
    if (typeof window !== "undefined") {
      const nextHash = t === "signup" ? "#signup" : "";
      history.replaceState(null, "", `${window.location.pathname}${nextHash}`);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/70 bg-card/80 shadow-elevation-lg backdrop-blur">
      <CardContent className="pt-6">
        <Tabs value={tab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-6">
            <SignInForm />
          </TabsContent>
          <TabsContent value="signup" className="mt-6">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
