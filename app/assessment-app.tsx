"use client";

import { useEffect, useState } from "react";
import { Anchor, ClipboardCheck, ShieldCheck, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagerPortal } from "@/components/manager-portal";
import { ParticipantPortal } from "@/components/participant-portal";

export function AssessmentApp() {
  const [portal, setPortal] = useState<"participant" | "manager">("participant");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("portal") === "manager") setPortal("manager");
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="ambient-grid" aria-hidden="true" />
      <header className="relative z-20 border-b border-white/10 bg-[#07141f]/88 text-white backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="brand-mark" aria-hidden="true">
              <Anchor className="size-5" strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-300">
                The Juicy Seafood & Bar
              </p>
              <p className="truncate text-base font-semibold tracking-tight sm:text-lg">
                Fred Hiring System
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 sm:flex">
            <ShieldCheck className="size-3.5 text-cyan-300" />
            Secure hiring workspace
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        <Tabs value={portal} onValueChange={(value) => setPortal(value as typeof portal)}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Hiring assessment</p>
              <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
                Select your access
              </h1>
            </div>
            <TabsList className="h-12 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
              <TabsTrigger value="participant" className="h-10 flex-1 gap-2 rounded-lg px-5 text-sm sm:flex-none">
                <UserRound className="size-4" /> Participant
              </TabsTrigger>
              <TabsTrigger value="manager" className="h-10 flex-1 gap-2 rounded-lg px-5 text-sm sm:flex-none">
                <ClipboardCheck className="size-4" /> Staff / Owner
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent forceMount value="participant" className="mt-0 focus-visible:outline-none data-[state=inactive]:hidden">
            <ParticipantPortal />
          </TabsContent>
          <TabsContent forceMount value="manager" className="mt-0 focus-visible:outline-none data-[state=inactive]:hidden">
            <ManagerPortal />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
