"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  FileSearch,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  TrendingUp,
  UserRoundCheck,
  Users,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  candidateReportFilename,
  candidateShareText,
  createCandidateReportPdf,
} from "@/lib/candidate-report";
import { candidateRoles, roleLabels, type CandidateRole } from "@/lib/question-bank";
import type { CandidateBiodata, StaffSession, SubmissionDetail, SubmissionSummary } from "@/lib/client-types";
import { OwnerManagerAccounts } from "@/components/owner-manager-accounts";
import { intlLocale, useI18n } from "@/lib/i18n";
import { localizeAnswerReviews } from "@/lib/question-localization";

const experienceLabels: Record<string, string> = {
  none: "No restaurant experience",
  under_1: "Less than 1 year",
  "1_2": "1–2 years",
  "3_5": "3–5 years",
  over_5: "More than 5 years",
};
const englishLabels: Record<string, string> = {
  basic: "Basic",
  conversational: "Conversational",
  professional: "Professional working level",
  fluent: "Fluent",
};
const hoursLabels: Record<string, string> = {
  under_20: "Under 20 hours",
  "20_30": "20–30 hours",
  "30_40": "30–40 hours",
  over_40: "More than 40 hours",
};
const trainingLabels: Record<string, string> = {
  not_applicable: "Not applicable",
  yes: "Completed / current",
  no: "Not completed",
  in_progress: "In progress",
};

function dateValue(value: string) {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function formatDate(value: string, locale: Parameters<typeof intlLocale>[0], full = false) {
  const date = dateValue(value);
  if (!date) return value;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(full ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

function formatDuration(seconds: number, t: (source: string, values?: Record<string, string | number>) => string) {
  const minutes = Math.max(0, Math.round(seconds / 60));
  return minutes < 60
    ? t("{minutes} min", { minutes })
    : t("{hours}h {minutes}m", { hours: Math.floor(minutes / 60), minutes: minutes % 60 });
}

function OutcomeBadge({ outcome }: { outcome: "pass" | "not_pass" }) {
  const { t } = useI18n();
  return outcome === "pass" ? (
    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50"><CheckCircle2 className="size-3.5" /> {t("Passed written test")}</Badge>
  ) : (
    <Badge className="border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-50"><XCircle className="size-3.5" /> {t("Did not pass written test")}</Badge>
  );
}

function ScoreRing({ value, size = "large" }: { value: number; size?: "small" | "large" }) {
  const { t } = useI18n();
  return (
    <div
      className={`score-ring ${size === "large" ? "size-28" : "size-14"}`}
      style={{ "--score": `${value * 3.6}deg` } as React.CSSProperties}
      aria-label={t("{percentage}% role fit", { percentage: value })}
    >
      <div className="score-ring-inner">
        <span className={size === "large" ? "text-3xl" : "text-sm"}>{value}</span>
        <small>%</small>
      </div>
    </div>
  );
}

function ManagerLogin({ onSuccess }: { onSuccess: (session: StaffSession) => void }) {
  const { t } = useI18n();
  const [username, setUsername] = useState("Fred");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/manager/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json()) as StaffSession & { error?: string };
      if (!response.ok || !data.authenticated) throw new Error(data.error || "Login failed.");
      onSuccess(data);
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : "Login failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[440px]">
      <Card className="border-slate-200 bg-white shadow-[0_22px_60px_rgba(8,32,48,.1)]">
        <CardHeader className="pb-3 pt-8 sm:px-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#071f2f] text-cyan-300"><LockKeyhole className="size-5" /></div>
          <CardTitle className="mt-4 text-2xl font-black tracking-tight text-slate-950">{t("Staff & Owner sign in")}</CardTitle>
          <p className="text-sm leading-6 text-slate-500">{t("Managers can review candidate analysis. The Owner also controls manager accounts.")}</p>
        </CardHeader>
        <CardContent className="pb-8 sm:px-8">
          <form onSubmit={login} className="space-y-5">
            <div className="space-y-2"><Label htmlFor="manager-name">{t("Username")}</Label><Input id="manager-name" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} className="h-12 rounded-xl" /></div>
            <div className="space-y-2"><Label htmlFor="manager-password">{t("Password")}</Label><Input id="manager-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="h-12 rounded-xl" /></div>
            {error && <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{error}</div>}
            <Button type="submit" disabled={loading || password.length < 8 || !username.trim()} className="h-12 w-full rounded-xl bg-[#e7512f] text-base font-bold text-white shadow-[0_5px_0_#b7371d] hover:bg-[#d94625] active:translate-y-1 active:shadow-none">{loading ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />} {t("Open secure workspace")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function ManagerPortal() {
  const { locale, t } = useI18n();
  const [session, setSession] = useState<"checking" | "guest" | "staff">("checking");
  const [staff, setStaff] = useState<StaffSession>({ authenticated: false, role: null, displayName: null, username: null });
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | CandidateRole>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<"all" | "pass" | "not_pass">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [answerScope, setAnswerScope] = useState<"review" | "all">("review");

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/manager/submissions", { cache: "no-store" });
      if (response.status === 401) {
        setSession("guest");
        setStaff({ authenticated: false, role: null, displayName: null, username: null });
        setSubmissions([]);
        return;
      }
      const data = (await response.json()) as { submissions?: SubmissionSummary[]; error?: string };
      if (!response.ok || !data.submissions) throw new Error(data.error || "Results could not be loaded.");
      setSubmissions(data.submissions);
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : "Results could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let active = true;
    fetch("/api/manager/session", { cache: "no-store" })
      .then(async (response) => (await response.json()) as StaffSession)
      .then((data) => {
        if (!active) return;
        setStaff(data);
        setSession(data.authenticated ? "staff" : "guest");
      })
      .catch(() => active && setSession("guest"));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (session === "staff") void loadSubmissions();
  }, [session, loadSubmissions]);

  useEffect(() => {
    if (session !== "staff") return;
    const refreshFromLiveUpdate = () => void loadSubmissions();
    window.addEventListener("fred-hiring-submissions-updated", refreshFromLiveUpdate);
    return () => window.removeEventListener("fred-hiring-submissions-updated", refreshFromLiveUpdate);
  }, [session, loadSubmissions]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return submissions.filter((item) => {
      const matchesSearch = !query || `${item.candidateName} ${item.phone}`.toLocaleLowerCase().includes(query);
      return matchesSearch && (roleFilter === "all" || item.role === roleFilter) && (outcomeFilter === "all" || item.outcome === outcomeFilter);
    });
  }, [outcomeFilter, roleFilter, search, submissions]);

  const stats = useMemo(() => {
    const passed = submissions.filter((item) => item.outcome === "pass").length;
    const average = submissions.length ? Math.round(submissions.reduce((sum, item) => sum + item.fitPercentage, 0) / submissions.length) : 0;
    const today = new Date().toDateString();
    const todayCount = submissions.filter((item) => dateValue(item.submittedAt)?.toDateString() === today).length;
    return { passed, average, todayCount };
  }, [submissions]);

  const dashboardCards: Array<{ Icon: LucideIcon; value: string | number; label: string; note: string }> = [
    { Icon: Users, value: submissions.length, label: t("Total candidates"), note: t("All submitted assessments") },
    { Icon: UserRoundCheck, value: stats.passed, label: t("Passed written test"), note: t("All minimums met") },
    { Icon: TrendingUp, value: `${stats.average}%`, label: t("Average role fit"), note: t("Across current records") },
    { Icon: CalendarDays, value: stats.todayCount, label: t("Submitted today"), note: t("Based on current device date") },
  ];

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    setAnswerScope("review");
    try {
      const response = await fetch(`/api/manager/submissions/${encodeURIComponent(id)}?lang=${encodeURIComponent(locale)}`, { cache: "no-store" });
      const data = (await response.json()) as { submission?: SubmissionDetail; error?: string };
      if (!response.ok || !data.submission) throw new Error(data.error || "Result detail could not be loaded.");
      const [answers, reviewItems] = await Promise.all([
        localizeAnswerReviews(data.submission.answers, locale),
        localizeAnswerReviews(data.submission.analysis.reviewItems, locale),
      ]);
      setDetail({ ...data.submission, answers, analysis: { ...data.submission.analysis, reviewItems } });
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : "Result detail could not be loaded."));
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/manager/logout", { method: "POST" });
    setSession("guest");
    setStaff({ authenticated: false, role: null, displayName: null, username: null });
    setSubmissions([]);
    setSelectedId(null);
  }

  useEffect(() => {
    if (selectedId) void openDetail(selectedId);
    // The selected report is rebuilt in the newly selected language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  if (session === "checking") {
    return <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500"><Loader2 className="mr-2 size-5 animate-spin" /> {t("Checking secure access…")}</div>;
  }

  if (session === "guest") {
    return <ManagerLogin onSuccess={(access) => { setStaff(access); setSession("staff"); }} />;
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[26px] bg-[#071f2f] px-5 py-6 text-white shadow-[0_24px_70px_rgba(4,25,40,.18)] sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-cyan-300"><ShieldCheck className="size-4" /> {staff.displayName || staff.username} · {t(staff.role === "owner" ? "Owner" : "Manager")}</div><h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">{t("Candidate review dashboard")}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{t("Deep analysis of job-related answers. The written result supports—but does not replace—a consistent manager review.")}</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={loadSubmissions} disabled={loading} className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> {t("Refresh")}</Button><Button variant="outline" onClick={logout} className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"><LogOut className="size-4" /> {t("Log out")}</Button></div>
        </div>
      </section>

      {staff.role === "owner" && <OwnerManagerAccounts />}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map(({ Icon, value, label, note }) => (
          <Card key={label} className="gap-0 border-slate-200 bg-white py-0 shadow-sm"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-sm font-bold text-slate-700">{label}</p><p className="mt-1 text-xs text-slate-400">{note}</p></div><Icon className="size-5 text-cyan-700" /></div></CardContent></Card>
        ))}
      </section>

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span className="flex gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{error}</span><button onClick={() => setError("")} className="font-bold">{t("Dismiss")}</button></div>}

      <Card className="gap-0 overflow-hidden border-slate-200 bg-white py-0 shadow-[0_16px_50px_rgba(8,32,48,.08)]">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><h3 className="text-lg font-black text-slate-950">{t("Assessment results")}</h3><p className="mt-1 text-sm text-slate-500">{t("Open a candidate for the full analysis and answer evidence.")}</p></div>
            <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_180px_170px]">
              <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("Search name or phone")} className="h-10 rounded-xl pl-9" /></div>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}><SelectTrigger className="h-10 w-full rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("All positions")}</SelectItem>{candidateRoles.map((role) => <SelectItem key={role} value={role}>{t(roleLabels[role])}</SelectItem>)}</SelectContent></Select>
              <Select value={outcomeFilter} onValueChange={(value) => setOutcomeFilter(value as typeof outcomeFilter)}><SelectTrigger className="h-10 w-full rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("All outcomes")}</SelectItem><SelectItem value="pass">{t("Passed")}</SelectItem><SelectItem value="not_pass">{t("Not passed")}</SelectItem></SelectContent></Select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="bg-slate-50 hover:bg-slate-50"><TableHead className="pl-5">{t("Candidate")}</TableHead><TableHead>{t("Position")}</TableHead><TableHead>{t("Submitted")}</TableHead><TableHead>{t("Score")}</TableHead><TableHead>{t("Written result")}</TableHead><TableHead className="pr-5 text-right">{t("Review")}</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="group">
                  <TableCell className="pl-5"><button type="button" onClick={() => void openDetail(item.id)} className="text-left"><span className="block font-bold text-slate-900 group-hover:text-cyan-800">{item.candidateName}</span><span className="mt-0.5 block text-xs text-slate-500">{item.phone}</span></button></TableCell>
                  <TableCell><Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{t(roleLabels[item.role])}</Badge></TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600">{formatDate(item.submittedAt, locale, true)}</TableCell>
                  <TableCell><div className="flex items-center gap-3"><ScoreRing value={item.fitPercentage} size="small" /><span className="text-xs text-slate-500">{formatDuration(item.durationSeconds, t)}</span></div></TableCell>
                  <TableCell><OutcomeBadge outcome={item.outcome} />{item.criticalMisses > 0 && <p className="mt-1 text-xs font-medium text-amber-700">{t("{count} critical review item(s)", { count: item.criticalMisses })}</p>}</TableCell>
                  <TableCell className="pr-5 text-right"><Button size="sm" variant="ghost" onClick={() => void openDetail(item.id)} className="rounded-lg text-cyan-800">{t("Open")} <ChevronRight className="size-4" /></Button></TableCell>
                </TableRow>
              ))}
              {!filtered.length && <TableRow><TableCell colSpan={6} className="h-40 text-center text-slate-500">{loading ? <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> {t("Loading results…")}</span> : t("No candidate results match these filters.")}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => { if (!open) { setSelectedId(null); setDetail(null); } }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl p-0 sm:max-w-[min(1120px,calc(100%-2rem))]" showCloseButton>
          {detailLoading || !detail ? (
            <div className="flex min-h-[440px] items-center justify-center text-slate-500"><Loader2 className="mr-2 size-5 animate-spin" /> {t("Building detailed analysis…")}</div>
          ) : (
            <CandidateDetail detail={detail} answerScope={answerScope} setAnswerScope={setAnswerScope} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CandidateDetail({
  detail,
  answerScope,
  setAnswerScope,
}: {
  detail: SubmissionDetail;
  answerScope: "review" | "all";
  setAnswerScope: (scope: "review" | "all") => void;
}) {
  const { locale, t } = useI18n();
  const [shareStatus, setShareStatus] = useState("");
  const bio = detail.biodata;
  const visibleAnswers = answerScope === "all"
    ? detail.answers
    : detail.answers.filter((answer) => answer.points < answer.maxPoints || answer.isCritical);
  const eligibilityNotes = [
    !bio.authorizedToWork ? t("Candidate did not self-confirm U.S. work authorization.") : null,
    !bio.meetsAgeRequirement ? t("Candidate did not self-confirm the position’s minimum age requirement.") : null,
  ].filter(Boolean) as string[];

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }

  function downloadReport(showStatus = true) {
    const filename = candidateReportFilename(detail);
    downloadBlob(createCandidateReportPdf(detail, locale), filename);
    if (showStatus) setShareStatus(t("{filename} downloaded.", { filename }));
    return filename;
  }

  async function shareReport() {
    const blob = createCandidateReportPdf(detail, locale);
    const filename = candidateReportFilename(detail);
    const file = new File([blob], filename, { type: "application/pdf" });
    const payload = {
      title: t("Candidate assessment - {name}", { name: detail.candidateName }),
      text: candidateShareText(detail, locale),
      files: [file],
    };
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share(payload);
        setShareStatus(t("PDF shared from this device."));
        return;
      }
      downloadBlob(blob, filename);
      setShareStatus(t("This browser cannot attach files directly. The PDF was downloaded so you can attach it to Email or WhatsApp."));
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      downloadBlob(blob, filename);
      setShareStatus(t("Direct file sharing was unavailable. The PDF was downloaded instead."));
    }
  }

  function emailReport() {
    const filename = downloadReport(false);
    const subject = t("Candidate assessment - {name}", { name: detail.candidateName });
    const body = `${candidateShareText(detail, locale)}\n\n${t("Please attach the downloaded file: {filename}", { filename })}`;
    setShareStatus(t("PDF downloaded. Your email app is opening; attach the downloaded PDF before sending."));
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function whatsappReport() {
    const filename = downloadReport(false);
    const text = `${candidateShareText(detail, locale)}\n\n${t("Please attach the downloaded file: {filename}", { filename })}`;
    setShareStatus(t("PDF downloaded. WhatsApp is opening; attach the downloaded PDF before sending."));
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <DialogHeader className="border-b border-white/10 bg-[#071f2f] px-5 py-6 text-left text-white sm:px-8">
        <div className="flex flex-col gap-5 pr-7 sm:flex-row sm:items-center sm:justify-between">
          <div><DialogDescription className="font-bold uppercase tracking-[.16em] text-cyan-300">{t("Candidate deep analysis")}</DialogDescription><DialogTitle className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">{detail.candidateName}</DialogTitle><div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300"><Badge className="bg-white/10 text-white hover:bg-white/10">{detail.roleLabel}</Badge><span>{detail.phone}</span><span aria-hidden="true">·</span><span>{formatDate(detail.submittedAt, locale, true)}</span></div></div>
          <div className="flex items-center gap-4"><ScoreRing value={detail.fitPercentage} /><div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">{t("Position fit")}</p><div className="mt-2"><OutcomeBadge outcome={detail.outcome} /></div><p className="mt-2 text-xs text-slate-400">{t("Written assessment only")}</p></div></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <Button type="button" onClick={() => downloadReport()} className="bg-cyan-300 font-bold text-[#071f2f] hover:bg-cyan-200"><Download className="size-4" /> {t("Download PDF")}</Button>
          <Button type="button" variant="outline" onClick={() => void shareReport()} className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Share2 className="size-4" /> {t("Share PDF")}</Button>
          <Button type="button" variant="outline" onClick={emailReport} className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Mail className="size-4" /> {t("Email")}</Button>
          <Button type="button" variant="outline" onClick={whatsappReport} className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"><MessageCircle className="size-4" /> WhatsApp</Button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">{t("For privacy, no public report link is created. “Share PDF” can attach the file directly on supported devices; Email and WhatsApp download it first for manual attachment.")}</p>
        {shareStatus && <p role="status" className="mt-2 rounded-lg border border-cyan-300/15 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100">{shareStatus}</p>}
      </DialogHeader>

      <Tabs defaultValue="analysis" className="bg-slate-50/70">
        <div className="sticky top-0 z-10 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 sm:px-8"><TabsList className="h-11 w-max min-w-full rounded-xl bg-slate-100 p-1"><TabsTrigger value="analysis" className="gap-2 rounded-lg px-4"><BarChart3 className="size-4" /> {t("Analysis")}</TabsTrigger><TabsTrigger value="biodata" className="gap-2 rounded-lg px-4"><BriefcaseBusiness className="size-4" /> {t("Biodata")}</TabsTrigger><TabsTrigger value="answers" className="gap-2 rounded-lg px-4"><FileSearch className="size-4" /> {t("Answer review")}</TabsTrigger><TabsTrigger value="legal" className="gap-2 rounded-lg px-4"><BookOpen className="size-4" /> {t("Scoring & legal use")}</TabsTrigger></TabsList></div>

        <TabsContent value="analysis" className="m-0 space-y-5 p-4 sm:p-8">
          <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><div className="flex gap-3"><div className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${detail.outcome === "pass" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{detail.outcome === "pass" ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}</div><div><h3 className="font-black text-slate-950">{t("Assessment conclusion")}</h3><p className="mt-2 leading-7 text-slate-600">{detail.analysis.summary}</p></div></div></CardContent></Card>

          <Card className={`overflow-hidden border-0 py-0 text-white shadow-xl ${detail.analysis.hiringRecommendation.status === "recommended" ? "bg-gradient-to-br from-emerald-700 via-emerald-800 to-[#071f2f]" : detail.analysis.hiringRecommendation.status === "conditional" ? "bg-gradient-to-br from-amber-600 via-amber-800 to-[#071f2f]" : "bg-gradient-to-br from-rose-700 via-rose-900 to-[#071f2f]"}`}>
            <CardContent className="relative p-5 sm:p-7">
              <div className="absolute -right-12 -top-14 size-44 rounded-full border border-white/10 bg-white/5" aria-hidden="true" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-white/65">{t("Hiring recommendation")}</p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-0.03em]">{detail.analysis.hiringRecommendation.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/80">{detail.analysis.hiringRecommendation.rationale}</p>
                </div>
                <div className="flex size-28 shrink-0 flex-col items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.2),0_18px_40px_rgba(0,0,0,.18)] backdrop-blur">
                  <span className="text-3xl font-black">{detail.analysis.hiringRecommendation.fitPercentage}%</span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-white/65">{t("role fit")}</span>
                </div>
              </div>
              <p className="relative mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-white/60">{t("Decision support only: Owner or Manager must confirm job-related evidence through the same structured process used for comparable candidates.")}</p>
            </CardContent>
          </Card>

          {detail.analysis.psychologyProfile.length > 0 && <section>
            <div className="mb-3 flex items-end justify-between gap-3"><div><h3 className="flex items-center gap-2 text-lg font-black text-slate-950"><Brain className="size-5 text-violet-700" /> {t("Work psychology profile")}</h3><p className="mt-1 text-sm text-slate-500">{t("Six non-clinical work traits based on the first 30 responses.")}</p></div><Badge variant="outline" className="hidden border-violet-200 bg-violet-50 text-violet-800 sm:inline-flex">{t("30 psychology questions")}</Badge></div>
            <div className="grid gap-4 md:grid-cols-2">
              {detail.analysis.psychologyProfile.map((item) => <Card key={item.trait} className={`gap-0 py-0 ${item.band === "strong" ? "border-emerald-200 bg-emerald-50/50" : item.band === "develop" ? "border-amber-200 bg-amber-50/50" : "border-rose-200 bg-rose-50/60"}`}><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-slate-950">{item.label}</p><Badge variant="outline" className={`mt-2 ${item.band === "strong" ? "border-emerald-200 bg-white text-emerald-800" : item.band === "develop" ? "border-amber-200 bg-white text-amber-800" : "border-rose-200 bg-white text-rose-800"}`}>{item.bandLabel}</Badge></div><span className="text-2xl font-black text-slate-950">{item.percentage}%</span></div><Progress value={item.percentage} className={`mt-4 h-2 bg-white ${item.band === "strong" ? "[&_[data-slot=progress-indicator]]:bg-emerald-500" : item.band === "develop" ? "[&_[data-slot=progress-indicator]]:bg-amber-500" : "[&_[data-slot=progress-indicator]]:bg-rose-500"}`} /><p className="mt-4 text-sm leading-6 text-slate-700">{item.interpretation}</p><div className="mt-3 rounded-xl border border-white bg-white/80 p-3 text-xs leading-5 text-slate-600"><strong>{t("Manager follow-up:")}</strong> {item.managerFollowUp}</div></CardContent></Card>)}
            </div>
            <p className="mt-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-900/80">{t("This profile describes job-related response patterns. It is not a clinical test, personality diagnosis, or substitute for a structured interview.")}</p>
          </section>}

          <section>
            <div className="mb-3 flex items-end justify-between gap-3"><div><h3 className="text-lg font-black text-slate-950">{t("SWOT hiring analysis")}</h3><p className="mt-1 text-sm text-slate-500">{t("Potential impact if this candidate joins the requested role.")}</p></div><Badge variant="outline" className="hidden border-cyan-200 bg-cyan-50 text-cyan-800 sm:inline-flex">{t("Evidence-based")}</Badge></div>
            <div className="grid gap-4 md:grid-cols-2">
              {([
                { key: "strengths", title: t("Strengths"), icon: CheckCircle2, items: detail.analysis.swot.strengths, shell: "border-emerald-200 bg-emerald-50/70", iconStyle: "bg-emerald-600 text-white", titleStyle: "text-emerald-950" },
                { key: "weaknesses", title: t("Weaknesses"), icon: AlertTriangle, items: detail.analysis.swot.weaknesses, shell: "border-amber-200 bg-amber-50/70", iconStyle: "bg-amber-500 text-white", titleStyle: "text-amber-950" },
                { key: "opportunities", title: t("Opportunities"), icon: TrendingUp, items: detail.analysis.swot.opportunities, shell: "border-cyan-200 bg-cyan-50/70", iconStyle: "bg-cyan-600 text-white", titleStyle: "text-cyan-950" },
                { key: "threats", title: t("Threats / hiring risks"), icon: ShieldCheck, items: detail.analysis.swot.threats, shell: "border-rose-200 bg-rose-50/70", iconStyle: "bg-rose-600 text-white", titleStyle: "text-rose-950" },
              ] as const).map(({ key, title, icon: Icon, items, shell, iconStyle, titleStyle }) => <Card key={key} className={`gap-0 py-0 ${shell}`}><CardContent className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className={`flex size-10 items-center justify-center rounded-xl shadow-sm ${iconStyle}`}><Icon className="size-5" /></span><h4 className={`font-black ${titleStyle}`}>{title}</h4></div><div className="mt-4 space-y-3">{items.map((item) => <div key={`${key}-${item.title}`} className="rounded-xl border border-white/80 bg-white/70 p-4 shadow-sm"><p className="text-sm font-black text-slate-900">{item.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p></div>)}</div></CardContent></Card>)}
            </div>
          </section>

          <Card className="gap-0 border-violet-200 bg-gradient-to-br from-white to-violet-50/70 py-0"><CardContent className="p-5 sm:p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-black text-slate-950">{t("If hired: improvement plan")}</h3><p className="mt-1 text-sm text-slate-500">{t("Prioritized coaching actions and estimated time to reach the stated success check.")}</p></div><Badge className="w-fit bg-violet-100 text-violet-800 hover:bg-violet-100">{t("Manager-adjusted timeline")}</Badge></div><div className="mt-5 space-y-4">{detail.analysis.developmentPlan.map((plan) => <div key={`${plan.priority}-${plan.area}`} className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-violet-700 text-xs font-black text-white">{plan.priority}</span><p className="font-black text-slate-900">{plan.area}</p>{plan.currentPercentage !== null && <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{t("Current {percentage}%", { percentage: plan.currentPercentage })}</Badge>}<Badge variant="outline" className="ml-auto border-violet-200 bg-violet-50 text-violet-800"><Clock3 className="mr-1 size-3" /> {plan.estimatedTimeline}</Badge></div><div className="mt-4 grid gap-3 text-sm leading-6 md:grid-cols-2"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-black uppercase tracking-[.1em] text-slate-400">{t("Action")}</p><p className="mt-1 text-slate-700">{plan.action}</p></div><div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs font-black uppercase tracking-[.1em] text-emerald-700">{t("Success check")}</p><p className="mt-1 text-emerald-950/80">{plan.successMeasure}</p></div></div></div>)}</div><p className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-3 text-xs leading-5 text-violet-900/80">{detail.analysis.developmentNote}</p></CardContent></Card>

          {eligibilityNotes.length > 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="flex items-center gap-2 font-black text-amber-950"><AlertTriangle className="size-5" /> {t("Separate eligibility verification needed")}</h3><ul className="mt-3 space-y-2 text-sm text-amber-900">{eligibilityNotes.map((note) => <li key={note}>• {note}</li>)}</ul><p className="mt-3 text-xs leading-5 text-amber-800">{t("These self-reported items are shown separately and are not included in the 1–100% assessment score.")}</p></div>}

          <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><h3 className="font-black text-slate-950">{t("Section evidence")}</h3><div className="mt-5 space-y-5">{detail.categoryScores.map((item) => <div key={item.category}><div className="mb-2 flex items-end justify-between gap-3"><div><p className="text-sm font-bold text-slate-800">{item.label}</p><p className="text-xs text-slate-400">{t("{score} of {max} points", { score: item.score, max: item.max })}</p></div><p className="text-lg font-black text-slate-950">{item.percentage}%</p></div><Progress value={item.percentage} className={`h-2 bg-slate-100 ${item.percentage >= 75 ? "[&_[data-slot=progress-indicator]]:bg-emerald-500" : item.percentage >= 65 ? "[&_[data-slot=progress-indicator]]:bg-amber-500" : "[&_[data-slot=progress-indicator]]:bg-rose-500"}`} /></div>)}</div></CardContent></Card>
            <Card className="gap-0 border-slate-200 bg-[#071f2f] py-0 text-white"><CardContent className="p-5 sm:p-6"><h3 className="font-black">{t("Decision criteria")}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{detail.analysis.methodology}</p>{detail.analysis.failedRules.length ? <div className="mt-5 space-y-2">{detail.analysis.failedRules.map((rule) => <div key={rule} className="flex gap-2 rounded-xl border border-rose-300/15 bg-rose-300/10 p-3 text-sm text-rose-100"><XCircle className="mt-0.5 size-4 shrink-0" />{rule}</div>)}</div> : <div className="mt-5 flex gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/10 p-3 text-sm text-emerald-100"><CheckCircle2 className="mt-0.5 size-4 shrink-0" />{t("All written-assessment minimums were met.")}</div>}<div className="mt-5 flex items-center gap-2 text-xs text-slate-400"><Clock3 className="size-4" /> {t("Completed in {duration}", { duration: formatDuration(detail.durationSeconds, t) })}</div></CardContent></Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><h3 className="flex items-center gap-2 font-black text-slate-950"><CheckCircle2 className="size-5 text-emerald-600" /> {t("Demonstrated strengths")}</h3><div className="mt-4 space-y-3">{detail.analysis.strengths.length ? detail.analysis.strengths.map((item) => <div key={item.category} className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4"><div className="flex justify-between gap-3"><p className="font-bold text-emerald-950">{item.label}</p><span className="font-black text-emerald-800">{item.percentage}%</span></div><p className="mt-1 text-sm leading-6 text-emerald-900/80">{item.statement}</p></div>) : <p className="text-sm text-slate-500">{t("No section reached the 75% strength marker. Use the follow-up prompts to verify capability.")}</p>}</div></CardContent></Card>
            <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><h3 className="flex items-center gap-2 font-black text-slate-950"><AlertTriangle className="size-5 text-amber-600" /> {t("Priority review areas")}</h3><div className="mt-4 space-y-3">{detail.analysis.priorities.length ? detail.analysis.priorities.map((item) => <div key={item.category} className="rounded-xl border border-amber-100 bg-amber-50/70 p-4"><div className="flex justify-between gap-3"><p className="font-bold text-amber-950">{item.label}</p><span className="font-black text-amber-800">{item.percentage}%</span></div><p className="mt-1 text-sm leading-6 text-amber-900/80">{item.statement}</p></div>) : <p className="text-sm text-slate-500">{t("No major section priority was identified. Still verify technical knowledge in interview.")}</p>}</div></CardContent></Card>
          </section>

          {detail.analysis.reviewItems.length > 0 && <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-black text-slate-950">{t("Highest-priority answer evidence")}</h3><p className="mt-1 text-sm text-slate-500">{t("Critical items appear first, followed by the lowest-scoring responses.")}</p></div><Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">{t("{count} zero-point critical item(s)", { count: detail.criticalMisses })}</Badge></div><div className="mt-4 grid gap-3">{detail.analysis.reviewItems.map((item) => <div key={item.questionId} className={`rounded-xl border p-4 ${item.isCritical && item.points === 0 ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50"}`}><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{item.questionId}</Badge>{item.isCritical && <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">{t("Critical")}</Badge>}<span className="ml-auto text-xs font-bold text-slate-500">{t("{points}/{max} points", { points: item.points, max: item.maxPoints })}</span></div><p className="mt-3 font-bold leading-6 text-slate-900">{item.prompt}</p><p className="mt-2 text-sm leading-6 text-slate-600"><strong>{t("Selected:")}</strong> {item.selectedText}</p><p className="mt-2 text-xs leading-5 text-slate-500"><strong>{t("Manager lens:")}</strong> {item.reviewNote}</p></div>)}</div></CardContent></Card>}

          <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><h3 className="font-black text-slate-950">{t("Structured interview follow-up")}</h3><ol className="mt-4 space-y-3">{detail.analysis.interviewPrompts.map((prompt, index) => <li key={prompt} className="flex gap-3 text-sm leading-6 text-slate-700"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-black text-cyan-800">{index + 1}</span><span>{prompt}</span></li>)}</ol></CardContent></Card>
        </TabsContent>

        <TabsContent value="biodata" className="m-0 space-y-5 p-4 sm:p-8">
          <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><h3 className="font-black text-slate-950">{t("Contact & application")}</h3><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><BioItem icon={Phone} label={t("Phone")} value={detail.phone} /><BioItem icon={Mail} label={t("Email")} value={bio.email || t("Not provided")} /><BioItem icon={MapPin} label={t("City / state")} value={bio.cityState} /><BioItem icon={CalendarDays} label={t("Available start")} value={bio.availableStartDate ? formatDate(`${bio.availableStartDate}T12:00:00`, locale) : t("Not provided")} /><BioItem icon={BriefcaseBusiness} label={t("Restaurant type")} value={detail.restaurantConceptLabel} /><BioItem icon={BriefcaseBusiness} label={t("Job family")} value={detail.jobFamilyLabel} /><BioItem icon={BriefcaseBusiness} label={t("Position")} value={detail.roleLabel} /><BioItem icon={BriefcaseBusiness} label={t("Experience")} value={detail.experienceLevelLabel || t(experienceLabels[bio.restaurantExperience] || bio.restaurantExperience || "Not provided")} /><BioItem icon={Clock3} label={t("Desired hours")} value={t(hoursLabels[bio.hoursDesired] || bio.hoursDesired || "Not provided")} /></div></CardContent></Card>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><h3 className="font-black text-slate-950">{t("Work history")}</h3><dl className="mt-4 space-y-4"><DataLine label={t("Most recent employer")} value={bio.mostRecentEmployer || t("Not provided")} /><DataLine label={t("Most recent role")} value={bio.mostRecentRole || t("Not provided")} /><DataLine label={t("Reason for leaving / searching")} value={bio.reasonLeaving || t("Not provided")} /></dl></CardContent></Card>
            <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><h3 className="font-black text-slate-950">{t("Availability & qualifications")}</h3><dl className="mt-4 space-y-4"><DataLine label={t("Days")} value={bio.availableDays.map((value) => t(value)).join(", ") || t("Not provided")} /><DataLine label={t("Shifts")} value={bio.availableShifts.map((value) => t(value)).join(", ") || t("Not provided")} /><DataLine label={t("Customer-facing English")} value={t(englishLabels[bio.englishComfort] || bio.englishComfort || "Not provided")} /><DataLine label={t("U.S. work authorization (self-report)")} value={t(bio.authorizedToWork ? "Yes" : "No")} /><DataLine label={t("Minimum age requirement (self-report)")} value={t(bio.meetsAgeRequirement ? "Yes" : "No")} /><DataLine label={t("Alcohol-service training")} value={t(trainingLabels[bio.alcoholTraining] || bio.alcoholTraining || "Not provided")} /></dl></CardContent></Card>
          </div>
          <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><h3 className="font-black text-slate-950">{t("Candidate statements")}</h3><dl className="mt-4 space-y-5"><DataLine label={t("Why this restaurant")} value={bio.whyJoin || t("Not provided")} /><DataLine label={t("Customer / teammate example")} value={bio.serviceExample || t("Not provided")} /></dl></CardContent></Card>
        </TabsContent>

        <TabsContent value="answers" className="m-0 space-y-5 p-4 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="text-xl font-black text-slate-950">{t("Answer-by-answer evidence")}</h3><p className="mt-1 text-sm text-slate-500">{t("Review selected answers and the job-related reason behind each expected standard.")}</p></div><div className="flex rounded-xl border border-slate-200 bg-white p-1"><Button size="sm" variant={answerScope === "review" ? "default" : "ghost"} onClick={() => setAnswerScope("review")} className="rounded-lg">{t("Items to review")}</Button><Button size="sm" variant={answerScope === "all" ? "default" : "ghost"} onClick={() => setAnswerScope("all")} className="rounded-lg">{t("All 75")}</Button></div></div>
          <div className="space-y-3">{visibleAnswers.map((answer) => <details key={answer.questionId} className={`group rounded-xl border bg-white ${answer.isCritical && answer.points === 0 ? "border-rose-200" : "border-slate-200"}`}><summary className="flex cursor-pointer list-none items-start gap-3 p-4 sm:p-5"><span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${answer.points === answer.maxPoints ? "bg-emerald-100 text-emerald-800" : answer.points === 0 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{answer.points}/{answer.maxPoints}</span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-slate-400">{answer.questionId} · {t(answer.categoryLabel)}{answer.isCritical && <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">{t("Critical")}</Badge>}</span><span className="mt-1 block font-bold leading-6 text-slate-900">{answer.prompt}</span></span><ChevronRight className="mt-1 size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-90" /></summary><div className="border-t border-slate-100 px-4 py-4 sm:px-5"><p className="text-sm leading-6 text-slate-700"><strong>{t("Selected answer:")}</strong> {answer.selectedText}</p><p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600"><strong>{t("Manager lens:")}</strong> {answer.reviewNote}</p></div></details>)}</div>
        </TabsContent>

        <TabsContent value="legal" className="m-0 space-y-5 p-4 sm:p-8">
          <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><h3 className="flex items-center gap-2 font-black text-slate-950"><ShieldCheck className="size-5 text-cyan-700" /> {t("Fair-use operating guide")}</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{[
            ["Same standard", "Give applicants for the same role the same instructions, question count, scoring formula, and threshold."],
            ["Job-related evidence", "Use only the role-relevant knowledge and situational responses shown here. Do not infer a medical condition or protected characteristic."],
            ["Reasonable accommodation", "Offer an accessible format or reasonable testing adjustment when requested, unless it would create an undue hardship."],
            ["Human decision", "Do not make a final hire/reject decision from this score alone. Use a structured interview and document the job-related reasons for the final decision."],
            ["Monitor impact", "Periodically compare outcomes and job performance. If a selection rule disproportionately excludes a protected group, obtain qualified legal/HR review and consider an equally effective alternative."],
            ["Protect records", "Limit candidate data to authorized managers, verify eligibility documents through the proper hiring process, and retain records under the company’s approved schedule."],
          ].map(([title, copy]) => <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-bold text-slate-900">{t(title)}</p><p className="mt-1 text-sm leading-6 text-slate-600">{t(copy)}</p></div>)}</div></CardContent></Card>

          <Card className="gap-0 border-cyan-200 bg-cyan-50/60 py-0"><CardContent className="p-5 sm:p-6"><h3 className="font-black text-cyan-950">{t("Alabama alcohol-service alignment")}</h3><p className="mt-2 text-sm leading-6 text-cyan-900/80">{t("Server and Bartender questions require escalation to current law, the restaurant’s license conditions, Responsible Vendor Program procedures, and Manager direction. Recipe questions test common foundational knowledge; the current approved house recipe always controls actual service.")}</p></CardContent></Card>

          <Card className="gap-0 border-slate-200 bg-white py-0"><CardContent className="p-5 sm:p-6"><h3 className="font-black text-slate-950">{t("Official references used")}</h3><div className="mt-4 grid gap-3">{[
            ["EEOC — Employment Tests and Selection Procedures", "https://www.eeoc.gov/laws/guidance/employment-tests-and-selection-procedures"],
            ["EEOC — Job Applicants and the ADA", "https://www.eeoc.gov/laws/guidance/job-applicants-and-ada"],
            ["Alabama Legislature — Age Discrimination law", "https://alison.legislature.state.al.us/code-of-alabama?section=25-1-21"],
            ["Alabama ABC Board — Responsible Vendor Program", "https://alabcboard.gov/licensing-compliance/responsible-vendor-program"],
            ["International Bartenders Association — Official Cocktail List", "https://iba-world.com/cocktails/"],
          ].map(([label, href]) => <a key={href} href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-50"><span>{t(label)}</span><ExternalLink className="size-4 shrink-0" /></a>)}</div><p className="mt-4 text-xs leading-5 text-slate-500">{t("Operational alignment only; this application is not a substitute for advice from qualified Alabama employment or alcohol-licensing counsel.")}</p></CardContent></Card>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t("Important limitation:")}</strong> {detail.analysis.limitation}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BioItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><Icon className="size-4 text-cyan-700" /><p className="mt-3 text-xs font-bold uppercase tracking-[.1em] text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-bold leading-6 text-slate-800">{value}</p></div>;
}

function DataLine({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-[.1em] text-slate-400">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{value}</dd></div>;
}
