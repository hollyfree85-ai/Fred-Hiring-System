"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { candidateRoles, categoryLabels, roleLabels, type CandidateRole } from "@/lib/question-bank";
import type { CandidateBiodata, CandidateIdentity, PublicQuestion } from "@/lib/client-types";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const shifts = ["Lunch", "Dinner", "Double / Long Shift"];
const alcoholTrainingRoles = new Set<CandidateRole>(["server", "bartender", "assistant_manager"]);

function emptyBiodata(role: CandidateRole): CandidateBiodata {
  return {
    email: "",
    cityState: "",
    availableStartDate: "",
    restaurantExperience: "",
    mostRecentEmployer: "",
    mostRecentRole: "",
    reasonLeaving: "",
    englishComfort: "",
    availableDays: [],
    availableShifts: [],
    hoursDesired: "",
    authorizedToWork: null,
    meetsAgeRequirement: null,
    alcoholTraining: alcoholTrainingRoles.has(role) ? "" : "not_applicable",
    whyJoin: "",
    serviceExample: "",
  };
}

const initialIdentity: CandidateIdentity = {
  candidateName: "",
  phone: "",
  role: "host_cashier",
};

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function ParticipantPortal() {
  const [stage, setStage] = useState<"entry" | "biodata" | "test" | "submitted">("entry");
  const [identity, setIdentity] = useState<CandidateIdentity>(initialIdentity);
  const [biodata, setBiodata] = useState<CandidateBiodata>(emptyBiodata("host_cashier"));
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [submissionKey, setSubmissionKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (stage !== "test") return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [stage]);

  const groupedProgress = useMemo(() => {
    const groups = [
      { label: "Psychology & Work Judgment", start: 0, end: 30 },
      { label: `${roleLabels[identity.role]} Technical`, start: 30, end: 75 },
    ];
    return groups.map((group) => ({
      ...group,
      answered: questions
        .slice(group.start, group.end)
        .filter((question) => Boolean(answers[question.id])).length,
    }));
  }, [answers, identity.role, questions]);

  function beginProfile() {
    setError("");
    const digits = identity.phone.replace(/\D/g, "");
    if (identity.candidateName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (digits.length < 7 || digits.length > 15) {
      setError("Please enter a valid phone number.");
      return;
    }
    setBiodata(emptyBiodata(identity.role));
    setSubmissionKey(crypto.randomUUID());
    setStage("biodata");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateBiodata() {
    if (biodata.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(biodata.email)) return "Enter a valid email or leave it blank.";
    if (biodata.cityState.trim().length < 2) return "Enter your city and state.";
    if (!biodata.availableStartDate) return "Choose the date you can start.";
    if (!biodata.restaurantExperience) return "Choose your restaurant experience.";
    if (!biodata.englishComfort) return "Choose your customer-facing English comfort level.";
    if (!biodata.availableDays.length) return "Choose at least one available day.";
    if (!biodata.availableShifts.length) return "Choose at least one available shift.";
    if (!biodata.hoursDesired) return "Choose your desired weekly hours.";
    if (biodata.authorizedToWork === null) return "Answer the U.S. work-authorization question.";
    if (biodata.meetsAgeRequirement === null) return "Confirm whether you meet the position’s minimum age requirement.";
    if (!biodata.alcoholTraining) return "Choose your alcohol-service training status.";
    return "";
  }

  async function startTest() {
    const validation = validateBiodata();
    if (validation) {
      setError(validation);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/questions?role=${identity.role}`, { cache: "no-store" });
      const data = (await response.json()) as { questions?: PublicQuestion[]; error?: string };
      if (!response.ok || !data.questions) throw new Error(data.error || "The test could not be loaded.");
      if (data.questions.length !== 75) throw new Error("The assessment is not ready. Please ask the manager for help.");
      setQuestions(data.questions);
      setAnswers({});
      setCurrentIndex(0);
      setStartedAt(Date.now());
      setStage("test");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The test could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  function toggleList(field: "availableDays" | "availableShifts", value: string, checked: boolean) {
    setBiodata((current) => ({
      ...current,
      [field]: checked
        ? [...current[field], value]
        : current[field].filter((item) => item !== value),
    }));
  }

  function goToQuestion(index: number) {
    const targetIndex = Math.max(0, Math.min(questions.length - 1, index));
    const unansweredBeforeTarget = questions
      .slice(0, targetIndex)
      .findIndex((question) => !answers[question.id]);
    if (unansweredBeforeTarget >= 0) {
      setCurrentIndex(unansweredBeforeTarget);
      setError(`Answer question ${unansweredBeforeTarget + 1} before opening later questions.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError("");
    setCurrentIndex(targetIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitAssessment() {
    if (answeredCount !== questions.length) {
      setConfirmOpen(false);
      const firstMissing = questions.findIndex((question) => !answers[question.id]);
      if (firstMissing >= 0) goToQuestion(firstMissing);
      setError(`Please answer all questions. ${questions.length - answeredCount} remaining.`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionKey,
          ...identity,
          biodata,
          answers,
          durationSeconds: Math.round((Date.now() - startedAt) / 1000),
          website: "",
        }),
      });
      const data = (await response.json()) as { received?: boolean; error?: string };
      if (!response.ok || !data.received) throw new Error(data.error || "The test could not be submitted.");
      setConfirmOpen(false);
      setStage("submitted");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setConfirmOpen(false);
      setError(caught instanceof Error ? caught.message : "The test could not be submitted.");
    } finally {
      setLoading(false);
    }
  }

  function resetPortal() {
    setStage("entry");
    setIdentity(initialIdentity);
    setBiodata(emptyBiodata("host_cashier"));
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setError("");
  }

  if (stage === "submitted") {
    return (
      <Card className="mx-auto max-w-2xl overflow-hidden border-0 bg-white shadow-[0_24px_80px_rgba(8,32,48,.14)]">
        <CardContent className="px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-10" />
          </div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Submission complete</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">Thank you, {identity.candidateName.split(" ")[0]}.</h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
            Your 75 answers and employment information were received. A manager will review the full assessment and contact you using the phone number provided.
          </p>
          <Button onClick={resetPortal} variant="outline" className="mt-8 h-11 rounded-xl px-6">Return to sign in</Button>
        </CardContent>
      </Card>
    );
  }

  if (stage === "entry") {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
        <section className="relative overflow-hidden rounded-[28px] bg-[#071f2f] p-6 text-white shadow-[0_30px_80px_rgba(4,25,40,.22)] sm:p-10 lg:min-h-[570px]">
          <div className="hero-orbit" aria-hidden="true" />
          <div className="relative z-10 flex h-full flex-col">
            <Badge className="w-fit border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-200 hover:bg-cyan-300/10">Applicant portal</Badge>
            <h2 className="mt-8 max-w-xl text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-5xl">
              Show how you handle a real restaurant shift.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              The assessment combines job-focused work judgment with technical questions tailored to the position you choose.
            </p>
            <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:mt-auto">
              {[
                ["75", "Total questions", ClipboardList],
                ["30", "Work judgment", ShieldCheck],
                ["45", "Role technical", BriefcaseBusiness],
              ].map(([value, label, Icon]) => (
                <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur-sm">
                  <Icon className="size-4 text-cyan-300" />
                  <p className="mt-4 text-2xl font-black">{String(value)}</p>
                  <p className="mt-1 text-sm text-slate-400">{String(label)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Card className="border-slate-200 bg-white shadow-[0_22px_60px_rgba(8,32,48,.1)]">
          <CardHeader className="pb-3 pt-7 sm:px-8">
            <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800"><UserRound className="size-5" /></div>
            <CardTitle className="mt-4 text-2xl font-black tracking-tight text-slate-950">Participant sign in</CardTitle>
            <p className="text-sm leading-6 text-slate-500">No account or sign-up is needed. Enter your details to continue.</p>
          </CardHeader>
          <CardContent className="space-y-5 pb-8 sm:px-8">
            <div className="space-y-2">
              <Label htmlFor="candidate-name">Full name</Label>
              <Input id="candidate-name" autoComplete="name" value={identity.candidateName} onChange={(event) => setIdentity((current) => ({ ...current, candidateName: event.target.value }))} className="h-12 rounded-xl" placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-phone">Phone number</Label>
              <div className="relative"><Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input id="candidate-phone" autoComplete="tel" inputMode="tel" value={identity.phone} onChange={(event) => setIdentity((current) => ({ ...current, phone: event.target.value }))} className="h-12 rounded-xl pl-10" placeholder="(256) 555-0123" /></div>
            </div>
            <div className="space-y-2">
              <Label>Position requested</Label>
              <Select value={identity.role} onValueChange={(value) => setIdentity((current) => ({ ...current, role: value as CandidateRole }))}>
                <SelectTrigger className="h-12 w-full rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {candidateRoles.map((role) => <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <ErrorMessage message={error} />
            <Button onClick={beginProfile} className="h-12 w-full rounded-xl bg-[#e7512f] text-base font-bold text-white hover:bg-[#d94625]">
              Continue to employment profile <ArrowRight className="size-4" />
            </Button>
            <p className="text-xs leading-5 text-slate-500">If you need a reasonable accommodation or another accessible format for this assessment, ask the hiring manager before beginning.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "biodata") {
    const ageText = identity.role === "bartender"
      ? "I am at least 21 years old for Bartender duties."
      : identity.role === "server"
        ? "I am at least 18 years old for alcohol-serving Server duties (subject to license/RVP verification)."
        : identity.role === "assistant_manager"
          ? "I meet the legal minimum age requirements for the Assistant Manager duties offered, including any alcohol duties assigned."
          : `I meet the legal minimum age requirements for the ${roleLabels[identity.role]} duties offered.`;
    return (
      <div className="mx-auto max-w-5xl">
        <Card className="border-slate-200 bg-white shadow-[0_22px_70px_rgba(8,32,48,.1)]">
          <CardHeader className="border-b border-slate-100 px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-800">Step 1 of 2</Badge>
                <CardTitle className="mt-3 text-2xl font-black tracking-tight text-slate-950">Employment profile</CardTitle>
                <p className="mt-1 text-sm text-slate-500">{identity.candidateName} · {roleLabels[identity.role]}</p>
              </div>
              <p className="max-w-sm text-sm leading-5 text-slate-500">Only job-related information is requested. Do not enter an SSN, medical information, or other sensitive records.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 px-5 py-7 sm:px-8">
            <section>
              <h3 className="section-kicker">Contact & experience</h3>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="bio-email">Email <span className="font-normal text-slate-400">(optional)</span></Label><Input id="bio-email" type="email" autoComplete="email" value={biodata.email} onChange={(event) => setBiodata((current) => ({ ...current, email: event.target.value }))} className="h-11 rounded-xl" placeholder="name@example.com" /></div>
                <div className="space-y-2"><Label htmlFor="bio-location">City and state</Label><Input id="bio-location" autoComplete="address-level2" value={biodata.cityState} onChange={(event) => setBiodata((current) => ({ ...current, cityState: event.target.value }))} className="h-11 rounded-xl" placeholder="Huntsville, Alabama" /></div>
                <div className="space-y-2"><Label htmlFor="bio-start">Available start date</Label><Input id="bio-start" type="date" value={biodata.availableStartDate} onChange={(event) => setBiodata((current) => ({ ...current, availableStartDate: event.target.value }))} className="h-11 rounded-xl" /></div>
                <div className="space-y-2"><Label>Restaurant experience</Label><Select value={biodata.restaurantExperience} onValueChange={(value) => setBiodata((current) => ({ ...current, restaurantExperience: value as CandidateBiodata["restaurantExperience"] }))}><SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder="Select experience" /></SelectTrigger><SelectContent><SelectItem value="none">No restaurant experience</SelectItem><SelectItem value="under_1">Less than 1 year</SelectItem><SelectItem value="1_2">1–2 years</SelectItem><SelectItem value="3_5">3–5 years</SelectItem><SelectItem value="over_5">More than 5 years</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="bio-employer">Most recent employer <span className="font-normal text-slate-400">(optional)</span></Label><Input id="bio-employer" value={biodata.mostRecentEmployer} onChange={(event) => setBiodata((current) => ({ ...current, mostRecentEmployer: event.target.value }))} className="h-11 rounded-xl" /></div>
                <div className="space-y-2"><Label htmlFor="bio-role">Most recent role <span className="font-normal text-slate-400">(optional)</span></Label><Input id="bio-role" value={biodata.mostRecentRole} onChange={(event) => setBiodata((current) => ({ ...current, mostRecentRole: event.target.value }))} className="h-11 rounded-xl" /></div>
                <div className="space-y-2 md:col-span-2"><Label htmlFor="bio-leaving">Reason for leaving / looking for a new role <span className="font-normal text-slate-400">(optional)</span></Label><Textarea id="bio-leaving" value={biodata.reasonLeaving} onChange={(event) => setBiodata((current) => ({ ...current, reasonLeaving: event.target.value }))} className="min-h-24 rounded-xl" maxLength={600} /></div>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-7">
              <h3 className="section-kicker">Availability & qualifications</h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div className="space-y-3 md:col-span-2"><Label>Days available</Label><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{days.map((day) => { const checked = biodata.availableDays.includes(day); return <label key={day} className={`check-tile ${checked ? "check-tile-active" : ""}`}><Checkbox checked={checked} onCheckedChange={(value) => toggleList("availableDays", day, value === true)} /><span>{day.slice(0, 3)}</span></label>; })}</div></div>
                <div className="space-y-3"><Label>Shifts available</Label><div className="space-y-2">{shifts.map((shift) => { const checked = biodata.availableShifts.includes(shift); return <label key={shift} className={`check-row ${checked ? "check-row-active" : ""}`}><Checkbox checked={checked} onCheckedChange={(value) => toggleList("availableShifts", shift, value === true)} /><span>{shift}</span></label>; })}</div></div>
                <div className="space-y-5">
                  <div className="space-y-2"><Label>Desired weekly hours</Label><Select value={biodata.hoursDesired} onValueChange={(value) => setBiodata((current) => ({ ...current, hoursDesired: value as CandidateBiodata["hoursDesired"] }))}><SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder="Select hours" /></SelectTrigger><SelectContent><SelectItem value="under_20">Under 20 hours</SelectItem><SelectItem value="20_30">20–30 hours</SelectItem><SelectItem value="30_40">30–40 hours</SelectItem><SelectItem value="over_40">More than 40 hours</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Customer-facing English comfort</Label><Select value={biodata.englishComfort} onValueChange={(value) => setBiodata((current) => ({ ...current, englishComfort: value as CandidateBiodata["englishComfort"] }))}><SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder="Select level" /></SelectTrigger><SelectContent><SelectItem value="basic">Basic</SelectItem><SelectItem value="conversational">Conversational</SelectItem><SelectItem value="professional">Professional working level</SelectItem><SelectItem value="fluent">Fluent</SelectItem></SelectContent></Select></div>
                  {alcoholTrainingRoles.has(identity.role) && <div className="space-y-2"><Label>Alcohol-service training</Label><Select value={biodata.alcoholTraining} onValueChange={(value) => setBiodata((current) => ({ ...current, alcoholTraining: value as CandidateBiodata["alcoholTraining"] }))}><SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="yes">Completed / current</SelectItem><SelectItem value="in_progress">In progress</SelectItem><SelectItem value="no">Not completed</SelectItem></SelectContent></Select></div>}
                </div>
                <div className="space-y-3 md:col-span-2"><Label>Are you legally authorized to work in the United States?</Label><RadioGroup value={biodata.authorizedToWork === null ? "" : biodata.authorizedToWork ? "yes" : "no"} onValueChange={(value) => setBiodata((current) => ({ ...current, authorizedToWork: value === "yes" }))} className="grid gap-2 sm:grid-cols-2"><label className="answer-option"><RadioGroupItem value="yes" /> Yes</label><label className="answer-option"><RadioGroupItem value="no" /> No</label></RadioGroup></div>
                <div className="space-y-3 md:col-span-2"><Label>{ageText}</Label><RadioGroup value={biodata.meetsAgeRequirement === null ? "" : biodata.meetsAgeRequirement ? "yes" : "no"} onValueChange={(value) => setBiodata((current) => ({ ...current, meetsAgeRequirement: value === "yes" }))} className="grid gap-2 sm:grid-cols-2"><label className="answer-option"><RadioGroupItem value="yes" /> Yes</label><label className="answer-option"><RadioGroupItem value="no" /> No</label></RadioGroup></div>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-7">
              <h3 className="section-kicker">About your interest</h3>
              <div className="mt-4 grid gap-5">
                <div className="space-y-2"><Label htmlFor="bio-why">Why would you like to work at The Juicy Seafood & Bar? <span className="font-normal text-slate-400">(optional)</span></Label><Textarea id="bio-why" value={biodata.whyJoin} onChange={(event) => setBiodata((current) => ({ ...current, whyJoin: event.target.value }))} className="min-h-24 rounded-xl" maxLength={800} /></div>
                <div className="space-y-2"><Label htmlFor="bio-example">Briefly describe a time you helped a customer or teammate. <span className="font-normal text-slate-400">(optional)</span></Label><Textarea id="bio-example" value={biodata.serviceExample} onChange={(event) => setBiodata((current) => ({ ...current, serviceExample: event.target.value }))} className="min-h-28 rounded-xl" maxLength={1000} /></div>
              </div>
            </section>
            <ErrorMessage message={error} />
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => { setError(""); setStage("entry"); }} className="h-11 rounded-xl"><ArrowLeft className="size-4" /> Back</Button>
              <Button onClick={startTest} disabled={loading} className="h-11 rounded-xl bg-[#e7512f] px-6 font-bold text-white hover:bg-[#d94625]">{loading ? <Loader2 className="size-4 animate-spin" /> : <ClipboardList className="size-4" />} Start 75-question assessment</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="flex min-h-72 items-center justify-center text-slate-500"><Loader2 className="mr-2 size-5 animate-spin" /> Loading assessment…</div>;
  }

  const allAnswered = answeredCount === questions.length;
  const firstUnansweredIndex = questions.findIndex((question) => !answers[question.id]);
  const unlockedThrough = firstUnansweredIndex === -1 ? questions.length - 1 : firstUnansweredIndex;
  return (
    <div className="quiz-layout grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
      <section className="quiz-stage">
        <div className="quiz-depth-orb quiz-depth-orb-one" aria-hidden="true" />
        <div className="quiz-depth-orb quiz-depth-orb-two" aria-hidden="true" />
        <Card key={currentQuestion.id} className="quiz-question-card overflow-hidden border-cyan-100 bg-white">
          <div className="quiz-question-header border-b border-white/10 px-5 py-5 text-white sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="quiz-question-number" aria-hidden="true">{String(currentIndex + 1).padStart(2, "0")}</div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">{currentIndex < 30 ? "Part 1 · Work Psychology & Judgment" : `Part 2 · ${roleLabels[identity.role]} Technical`}</p>
                  <p className="mt-1 text-sm font-medium text-slate-300">Question {currentIndex + 1} of {questions.length}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-white/15 bg-white/10 text-white backdrop-blur-sm">{categoryLabels[currentQuestion.category]}</Badge>
            </div>
            <Progress value={((currentIndex + 1) / questions.length) * 100} className="quiz-main-progress mt-5 h-2.5 bg-white/10 [&_[data-slot=progress-indicator]]:bg-[linear-gradient(90deg,#5eeaf2,#ff805f)]" />
          </div>
          <CardContent className="quiz-question-content px-5 py-7 sm:px-8 sm:py-9">
            <fieldset>
              <legend className="max-w-3xl text-xl font-black leading-8 tracking-[-0.02em] text-slate-950 sm:text-2xl">{currentQuestion.prompt}</legend>
              <RadioGroup value={answers[currentQuestion.id] ?? ""} onValueChange={(value) => { setAnswers((current) => ({ ...current, [currentQuestion.id]: value })); setError(""); }} className="mt-7 gap-3">
                {currentQuestion.options.map((option, index) => {
                  const selected = answers[currentQuestion.id] === option.id;
                  return (
                    <label key={option.id} style={{ animationDelay: `${index * 45}ms` }} className={`test-choice quiz-choice-enter ${selected ? "test-choice-selected" : ""}`}>
                      <RadioGroupItem value={option.id} className="mt-0.5" />
                      <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="leading-6">{option.text}</span>
                      {selected && <Check className="ml-auto size-5 shrink-0 text-cyan-700" />}
                    </label>
                  );
                })}
              </RadioGroup>
            </fieldset>
            <div className="mt-7"><ErrorMessage message={error} /></div>
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" disabled={currentIndex === 0} onClick={() => goToQuestion(currentIndex - 1)} className="h-11 rounded-xl"><ArrowLeft className="size-4" /> Previous</Button>
              {currentIndex < questions.length - 1 ? (
                <Button disabled={!answers[currentQuestion.id]} onClick={() => goToQuestion(currentIndex + 1)} className="h-11 rounded-xl bg-[#0b6f79] px-6 font-bold text-white shadow-[0_5px_0_#054a51] hover:bg-[#085d66] active:translate-y-1 active:shadow-none disabled:shadow-none">Next question <ArrowRight className="size-4" /></Button>
              ) : (
                <Button disabled={!answers[currentQuestion.id]} onClick={() => setConfirmOpen(true)} className="h-11 rounded-xl bg-[#e7512f] px-6 font-bold text-white shadow-[0_5px_0_#b7371d] hover:bg-[#d94625] active:translate-y-1 active:shadow-none disabled:shadow-none">Review & submit <CheckCircle2 className="size-4" /></Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
        <Card className="quiz-progress-card border-slate-700 bg-[#071f2f] text-white shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.15em] text-cyan-300">Progress</p><p className="mt-1 text-3xl font-black">{answeredCount}<span className="text-base text-slate-400"> / 75</span></p></div><Clock3 className="size-6 text-cyan-300" /></div>
            <div className="mt-5 space-y-4">{groupedProgress.map((group) => <div key={group.label}><div className="mb-1.5 flex justify-between gap-2 text-xs"><span className="text-slate-300">{group.label}</span><span className="font-bold">{group.answered}/{group.end - group.start}</span></div><Progress value={(group.answered / (group.end - group.start)) * 100} className="h-1.5 bg-white/10 [&_[data-slot=progress-indicator]]:bg-cyan-300" /></div>)}</div>
          </CardContent>
        </Card>
        <Card className="quiz-navigator-card border-slate-200 bg-white">
          <CardContent className="p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-slate-500">Question navigator</p>
            <div className="question-grid">{questions.map((question, index) => { const locked = index > unlockedThrough; return <button key={question.id} type="button" disabled={locked} onClick={() => goToQuestion(index)} aria-label={locked ? `Question ${index + 1} locked until earlier questions are answered` : `Go to question ${index + 1}`} aria-current={index === currentIndex ? "step" : undefined} className={`${answers[question.id] ? "question-done" : ""} ${index === currentIndex ? "question-current" : ""} ${locked ? "question-locked" : ""}`}>{index + 1}</button>; })}</div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Questions unlock in order. Finish each answer before moving forward.</p>
          </CardContent>
        </Card>
      </aside>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-2xl font-black">Submit your assessment?</DialogTitle><DialogDescription className="leading-6">You answered {answeredCount} of {questions.length} questions. After submission, answers cannot be changed.</DialogDescription></DialogHeader>
          <div className={`rounded-xl border p-4 text-sm ${allAnswered ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{allAnswered ? "All 75 questions are complete." : `${questions.length - answeredCount} question(s) still need an answer.`}</div>
          <DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)} className="rounded-xl">Keep reviewing</Button><Button onClick={submitAssessment} disabled={!allAnswered || loading} className="rounded-xl bg-[#e7512f] font-bold text-white hover:bg-[#d94625]">{loading && <Loader2 className="size-4 animate-spin" />} Submit final</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
