"use client";

import { useEffect, useState } from "react";
import { Download, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches
    || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

export function InstallAppButton() {
  const { t } = useI18n();
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const markInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (!promptEvent) {
      setInstructionsOpen(true);
      return;
    }
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setPromptEvent(null);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => void install()}
        className="h-10 border-white/15 bg-white/10 px-3 text-white hover:bg-white/15 hover:text-white"
      >
        <Download className="size-4 text-cyan-300" />
        <span className="hidden md:inline">{t("Install app")}</span>
      </Button>
      <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 grid size-12 place-items-center rounded-xl bg-cyan-50 text-cyan-800"><Smartphone className="size-6" /></div>
            <DialogTitle className="text-2xl font-black">{t("Install Fred Hiring System")}</DialogTitle>
            <DialogDescription className="leading-6">{t("Install this website on your phone, tablet, or computer so it opens like a regular app.")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-6 text-slate-700">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><strong>{t("Android / Chrome:")}</strong> {t("Open the browser menu, then choose Install app or Add to Home screen.")}</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><strong>{t("iPhone / iPad:")}</strong> {t("Open in Safari, tap Share, then choose Add to Home Screen.")}</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><strong>{t("Computer / Chrome:")}</strong> {t("Click the install icon in the address bar, or open the browser menu and choose Install Fred Hiring System.")}</div>
          </div>
          <Button type="button" onClick={() => setInstructionsOpen(false)} className="h-11 rounded-xl bg-cyan-800 text-white hover:bg-cyan-900"><Share className="size-4" /> {t("Got it")}</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
