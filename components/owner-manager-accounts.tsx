"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Pencil,
  ShieldCheck,
  Trash2,
  UserPlus,
  UsersRound,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ManagerAccount } from "@/lib/client-types";

const emptyForm = { displayName: "", username: "", password: "", confirmPassword: "" };

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Recently";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function OwnerManagerAccounts() {
  const [managers, setManagers] = useState<ManagerAccount[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<ManagerAccount | null>(null);
  const [editName, setEditName] = useState("");
  const [removing, setRemoving] = useState<ManagerAccount | null>(null);

  const loadManagers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/owner/managers", { cache: "no-store" });
      const data = (await response.json()) as { managers?: ManagerAccount[]; error?: string };
      if (!response.ok || !data.managers) throw new Error(data.error || "Manager accounts could not be loaded.");
      setManagers(data.managers);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Manager accounts could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadManagers();
  }, [loadManagers]);

  async function createManager(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/owner/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          username: form.username,
          password: form.password,
        }),
      });
      const data = (await response.json()) as { manager?: ManagerAccount; error?: string };
      if (!response.ok || !data.manager) throw new Error(data.error || "Manager account could not be created.");
      setForm(emptyForm);
      setSuccess(`${data.manager.displayName} can now sign in as ${data.manager.username}. Share the temporary password securely.`);
      await loadManagers();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Manager account could not be created.");
    } finally {
      setSaving(false);
    }
  }

  async function updateManager(account: ManagerAccount, displayName: string, status: "active" | "disabled") {
    setPendingId(account.id);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/owner/managers/${encodeURIComponent(account.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, status }),
      });
      const data = (await response.json()) as { updated?: boolean; error?: string };
      if (!response.ok || !data.updated) throw new Error(data.error || "Manager account could not be updated.");
      setManagers((current) => current.map((item) => (
        item.id === account.id ? { ...item, displayName, status, updatedAt: new Date().toISOString() } : item
      )));
      setSuccess(`${displayName}'s access was updated.`);
      setEditing(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Manager account could not be updated.");
    } finally {
      setPendingId("");
    }
  }

  async function removeManager() {
    if (!removing) return;
    const account = removing;
    setPendingId(account.id);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/owner/managers/${encodeURIComponent(account.id)}`, { method: "DELETE" });
      const data = (await response.json()) as { removed?: boolean; error?: string };
      if (!response.ok || !data.removed) throw new Error(data.error || "Manager account could not be removed.");
      setManagers((current) => current.filter((item) => item.id !== account.id));
      setSuccess(`${account.displayName}'s manager access was removed.`);
      setRemoving(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Manager account could not be removed.");
    } finally {
      setPendingId("");
    }
  }

  return (
    <Card className="owner-console overflow-hidden border-0 bg-white py-0 shadow-[0_22px_70px_rgba(8,32,48,.12)]">
      <div className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(125deg,#0a2537,#063f49)] px-5 py-6 text-white sm:px-7">
        <div className="owner-console-orbit" aria-hidden="true" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-cyan-300"><ShieldCheck className="size-4" /> Owner controls</div>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.035em]">Manager accounts</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Create staff logins and control who can preview candidate results, detailed analysis, and PDF reports.</p>
          </div>
          <Badge className="w-fit border-white/10 bg-white/10 px-3 py-1.5 text-white hover:bg-white/10"><UsersRound className="size-4" /> {managers.length} manager{managers.length === 1 ? "" : "s"}</Badge>
        </div>
      </div>

      <CardContent className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[minmax(320px,.82fr)_minmax(0,1.18fr)]">
        <form onSubmit={createManager} className="manager-create-panel rounded-2xl border border-cyan-100 bg-cyan-50/50 p-5">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-cyan-700 text-white shadow-lg shadow-cyan-900/15"><UserPlus className="size-5" /></span><div><h4 className="font-black text-slate-950">Create manager</h4><p className="text-sm text-slate-500">Only the Owner can do this.</p></div></div>
          <div className="mt-5 space-y-4">
            <div className="space-y-2"><Label htmlFor="new-manager-name">Display name</Label><Input id="new-manager-name" value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} minLength={2} maxLength={80} required className="h-11 rounded-xl bg-white" placeholder="Manager's full name" /></div>
            <div className="space-y-2"><Label htmlFor="new-manager-username">Username</Label><Input id="new-manager-username" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))} minLength={3} maxLength={32} required autoCapitalize="none" spellCheck={false} className="h-11 rounded-xl bg-white" placeholder="e.g. manager_huntsville" /><p className="text-xs leading-5 text-slate-500">3–32 letters, numbers, underscores, or hyphens. Username cannot be changed later.</p></div>
            <div className="space-y-2"><Label htmlFor="new-manager-password">Temporary password</Label><div className="relative"><KeyRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input id="new-manager-password" type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} minLength={8} maxLength={72} required className="h-11 rounded-xl bg-white pl-10" placeholder="At least 8 characters" /></div></div>
            <div className="space-y-2"><Label htmlFor="confirm-manager-password">Confirm password</Label><Input id="confirm-manager-password" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))} minLength={8} maxLength={72} required className="h-11 rounded-xl bg-white" placeholder="Repeat temporary password" /></div>
          </div>
          <Button type="submit" disabled={saving} className="mt-5 h-11 w-full rounded-xl bg-[#e7512f] font-bold text-white shadow-[0_5px_0_#b7371d] hover:bg-[#d94625] active:translate-y-1 active:shadow-none">{saving ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Create manager account</Button>
          <p className="mt-4 text-xs leading-5 text-slate-500">Passwords are handled by Firebase Authentication and are never stored in candidate data or shown again here.</p>
        </form>

        <section>
          <div className="flex items-end justify-between gap-3"><div><h4 className="font-black text-slate-950">Authorized managers</h4><p className="mt-1 text-sm text-slate-500">Disable access temporarily or remove it permanently.</p></div><Button type="button" size="sm" variant="ghost" onClick={() => void loadManagers()} disabled={loading} className="rounded-lg">{loading && <Loader2 className="size-4 animate-spin" />} Refresh</Button></div>

          {(error || success) && <div role={error ? "alert" : "status"} className={`mt-4 flex gap-2 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}<span>{error || success}</span></div>}

          <div className="mt-4 space-y-3">
            {managers.map((account) => {
              const active = account.status === "active";
              const pending = pendingId === account.id;
              return (
                <article key={account.id} className="manager-account-card flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                  <div className={`grid size-11 shrink-0 place-items-center rounded-xl font-black ${active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{account.displayName.slice(0, 1).toUpperCase()}</div>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h5 className="truncate font-black text-slate-950">{account.displayName}</h5><Badge className={active ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-100"}>{active ? "Active" : "Disabled"}</Badge></div><p className="mt-1 text-sm font-semibold text-cyan-800">@{account.username}</p><p className="mt-1 text-xs text-slate-400">Created {formatDate(account.createdAt)}</p></div>
                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:justify-end sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"><label className="flex items-center gap-2 text-xs font-bold text-slate-600"><Switch checked={active} disabled={pending} onCheckedChange={(checked) => void updateManager(account, account.displayName, checked ? "active" : "disabled")} aria-label={`${active ? "Disable" : "Enable"} ${account.displayName}`} /> {active ? "Enabled" : "Disabled"}</label><Button type="button" size="icon-sm" variant="outline" disabled={pending} onClick={() => { setEditing(account); setEditName(account.displayName); }} aria-label={`Edit ${account.displayName}`} className="rounded-lg"><Pencil className="size-4" /></Button><Button type="button" size="icon-sm" variant="outline" disabled={pending} onClick={() => setRemoving(account)} aria-label={`Remove ${account.displayName}`} className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800">{pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</Button></div>
                </article>
              );
            })}
            {!loading && !managers.length && <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><div><UsersRound className="mx-auto size-8 text-slate-300" /><p className="mt-3 font-bold text-slate-700">No manager accounts yet</p><p className="mt-1 text-sm text-slate-500">Create the first one using the Owner form.</p></div></div>}
            {loading && !managers.length && <div className="flex min-h-48 items-center justify-center text-sm text-slate-500"><Loader2 className="mr-2 size-4 animate-spin" /> Loading manager accounts…</div>}
          </div>
        </section>
      </CardContent>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle className="text-2xl font-black">Edit manager</DialogTitle><DialogDescription>Update the display name. The sign-in username stays fixed for security.</DialogDescription></DialogHeader>
          <div className="space-y-2"><Label htmlFor="edit-manager-name">Display name</Label><Input id="edit-manager-name" value={editName} onChange={(event) => setEditName(event.target.value)} minLength={2} maxLength={80} className="h-11 rounded-xl" /></div>
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)} className="rounded-xl">Cancel</Button><Button disabled={!editing || editName.trim().length < 2 || pendingId === editing?.id} onClick={() => editing && void updateManager(editing, editName.trim(), editing.status === "active" ? "active" : "disabled")} className="rounded-xl bg-cyan-800 text-white hover:bg-cyan-900">Save changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(removing)} onOpenChange={(open) => { if (!open) setRemoving(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader><AlertDialogTitle>Remove manager access?</AlertDialogTitle><AlertDialogDescription>{removing?.displayName} will be signed out and permanently lose access to candidate results and analysis. This username cannot be reused.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={!removing || pendingId === removing?.id} onClick={() => void removeManager()} className="rounded-xl">Remove access</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
