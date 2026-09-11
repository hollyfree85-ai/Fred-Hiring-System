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
  ChevronsUpDown,
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
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { categoryLabels, roleLabels, type CandidateRole } from "@/lib/question-bank";
import {
  experienceLevelLabels,
  familyForRole,
  jobFamilies,
  positionForRole,
  positionRequiresAlcoholTraining,
  restaurantConcepts,
  restaurantGroups,
  type ExperienceLevel,
  type JobFamilyId,
  type RestaurantConceptId,
} from "@/lib/industry-catalog";
import type { CandidateBiodata, CandidateIdentity, PublicQuestion } from "@/lib/client-types";
import { intlLocale, useI18n } from "@/lib/i18n";
import { localizeQuestions } from "@/lib/question-localization";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const shifts = ["Lunch", "Dinner", "Double / Long Shift"];
const defaultRestaurantConcept = "concept_006" as RestaurantConceptId;
const defaultJobFamily = "host_cashier_front_desk" as JobFamilyId;

const initialIdentity: CandidateIdentity = {
  candidateName: "",
  phone: "",
  role: "host_cashier",
  restaurantConcept: defaultRestaurantConcept,
  jobFamily: defaultJobFamily,
  experienceLevel: "none",
};

function emptyBiodata(identity: CandidateIdentity): CandidateBiodata {
  return {
    email: "",
    cityState: "",
    availableStartDate: "",
    restaurantExperience: identity.experienceLevel,
    mostRecentEmployer: "",
    mostRecentRole: "",
    reasonLeaving: "",
    englishComfort: "",
    availableDays: [],
    availableShifts: [],
    hoursDesired: "",
    authorizedToWork: null,
    meetsAgeRequirement: null,
    alcoholTraining: positionRequiresAlcoholTraining(identity.role) ? "" : "not_applicable",
    whyJoin: "",
    serviceExample: "",
    restaurantConcept: identity.restaurantConcept || defaultRestaurantConcept,
    jobFamily: identity.jobFamily || defaultJobFamily,
    experienceLevel: identity.experienceLevel || "none",
  };
}

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
  const { locale, t } = useI18n();
  const [stage, setStage] = useState<"entry" | "biodata" | "test" | "submitted">("entry");
  const [identity, setIdentity] = useState<CandidateIdentity>(initialIdentity);
  const [biodata, setBiodata] = useState<CandidateBiodata>(emptyBiodata(initialIdentity));
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [sourceQuestions, setSourceQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [submissionKey, setSubmissionKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restaurantPickerOpen, setRestaurantPickerOpen] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];
  const selectedFamily = jobFamilies.find((family) => family.id === identity.jobFamily) || jobFamilies[3];
  const collator = useMemo(
    () => new Intl.Collator(intlLocale(locale), { sensitivity: "base" }),
    [locale],
  );
  const sortedJobFamilies = useMemo(
    () => [...jobFamilies].sort((left, right) => collator.compare(t(left.label), t(right.label))),
    [collator, t],
  );
  const sortedPositions = useMemo(
    () => [...selectedFamily.positions].sort((left, right) => collator.compare(t(left.label), t(right.label))),
    [collator, selectedFamily, t],
  );
  const selectedRestaurantConcept = restaurantConcepts.find((concept) => concept.id === identity.restaurantConcept);
  const sortedRestaurantGroups = useMemo(
    () => [...restaurantGroups]
      .map((group) => ({
        ...group,
        concepts: restaurantConcepts
          .filter((concept) => concept.group === group.id)
          .sort((left, right) => collator.compare(left.label, right.label)),
      }))
      .sort((left, right) => collator.compare(t(left.label), t(right.label))),
    [collator, t],
  );

  useEffect(() => {
    if (stage !== "test") return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [stage]);

  useEffect(() => {
    if (!sourceQuestions.length) return;
    let active = true;
    void localizeQuestions(sourceQuestions, locale).then((localized) => {
      if (active) setQuestions(localized);
    });
    return () => { active = false; };
  }, [locale, sourceQuestions]);

  const groupedProgress = useMemo(() => {
    const groups = [
      { label: t("Psychology & Work Judgment"), start: 0, end: 30 },
      { label: t("{role} Technical", { role: t(roleLabels[identity.role]) }), start: 30, end: 75 },
    ];
    return groups.map((group) => ({
      ...group,
      answered: questions
        .slice(group.start, group.end)
        .filter((question) => Boolean(answers[question.id])).length,
    }));
  }, [answers, identity.role, questions, t]);

  function beginProfile() {
    setError("");
    const digits = identity.phone.replace(/\D/g, "");
    if (identity.candidateName.trim().length < 2) {
      setError(t("Please enter your full name."));
      return;
    }
    if (digits.length < 7 || digits.length > 15) {
      setError(t("Please enter a valid phone number."));
      return;
    }
    if (!identity.restaurantConcept || !identity.jobFamily || !identity.experienceLevel) {
      setError(t("Choose a restaurant type, job family, position, and experience level."));
      return;
    }
    if (familyForRole(identity.role).id !== identity.jobFamily) {
      setError(t("Choose a position from the selected job family."));
      return;
    }
    setBiodata(emptyBiodata(identity));
    setSubmissionKey(crypto.randomUUID());
    setStage("biodata");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateBiodata() {
    if (biodata.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(biodata.email)) return t("Enter a valid email or leave it blank.");
    if (biodata.cityState.trim().length < 2) return t("Enter your city and state.");
    if (!biodata.availableStartDate) return t("Choose the date you can start.");
    if (!biodata.restaurantExperience) return t("Choose your restaurant experience.");
    if (!biodata.englishComfort) return t("Choose your customer-facing English comfort level.");
    if (!biodata.availableDays.length) return t("Choose at least one available day.");
    if (!biodata.availableShifts.length) return t("Choose at least one available shift.");
    if (!biodata.hoursDesired) return t("Choose your desired weekly hours.");
    if (biodata.authorizedToWork === null) return t("Answer the U.S. work-authorization question.");
    if (biodata.meetsAgeRequirement === null) return t("Confirm whether you meet the position’s minimum age requirement.");
    if (!biodata.alcoholTraining) return t("Choose your alcohol-service training status.");
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
      const query = new URLSearchParams({
        role: identity.role,
        restaurantConcept: biodata.restaurantConcept,
        jobFamily: biodata.jobFamily,
        experienceLevel: biodata.experienceLevel,
        seed: submissionKey,
      });
      const response = await fetch(`/api/questions?${query.toString()}`, { cache: "no-store" });
      const data = (await response.json()) as { questions?: PublicQuestion[]; error?: string };
      if (!response.ok || !data.questions) throw new Error(data.error || t("The test could not be loaded."));
      if (data.questions.length !== 75) throw new Error(t("The assessment is not ready. Please ask the manager for help."));
      setSourceQuestions(data.questions);
      setQuestions(await localizeQuestions(data.questions, locale));
      setAnswers({});
      setCurrentIndex(0);
      setStartedAt(Date.now());
      setStage("test");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : "The test could not be loaded."));
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
      setError(t("Answer question {number} before opening later questions.", { number: unansweredBeforeTarget + 1 }));
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
      setError(t("Please answer all questions. {count} remaining.", { count: questions.length - answeredCount }));
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
      if (!response.ok || !data.received) throw new Error(data.error || t("The test could not be submitted."));
      setConfirmOpen(false);
      setStage("submitted");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setConfirmOpen(false);
      setError(t(caught instanceof Error ? caught.message : "The test could not be submitted."));
    } finally {
      setLoading(false);
    }
  }

  function resetPortal() {
    setStage("entry");
    setIdentity(initialIdentity);
    setBiodata(emptyBiodata(initialIdentity));
    setQuestions([]);
    setSourceQuestions([]);
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
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">{t("Submission complete")}</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">{t("Thank you, {name}.", { name: identity.candidateName.split(" ")[0] })}</h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
            {t("Your 75 answers and employment information were received. A manager will review the full assessment and contact you using the phone number provided.")}
          </p>
          <Button onClick={resetPortal} variant="outline" className="mt-8 h-11 rounded-xl px-6">{t("Return to sign in")}</Button>
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
            <Badge className="w-fit border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-200 hover:bg-cyan-300/10">{t("Applicant portal")}</Badge>
            <h2 className="mt-8 max-w-xl text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-5xl">
              {t("Show how you handle a real restaurant shift.")}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              {t("The assessment combines 30 non-clinical work-psychology questions with 45 technical questions tailored to the position you choose.")}
            </p>
          </div>
        </section>

        <Card className="border-slate-200 bg-white shadow-[0_22px_60px_rgba(8,32,48,.1)]">
          <CardHeader className="pb-3 pt-7 sm:px-8">
            <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800"><UserRound className="size-5" /></div>
            <CardTitle className="mt-4 text-2xl font-black tracking-tight text-slate-950">{t("Participant sign in")}</CardTitle>
            <p className="text-sm leading-6 text-slate-500">{t("No account or sign-up is needed. Enter your details to continue.")}</p>
          </CardHeader>
          <CardContent className="space-y-5 pb-8 sm:px-8">
            <div className="space-y-2">
              <Label htmlFor="candidate-name">{t("Full name")}</Label>
              <Input id="candidate-name" autoComplete="name" value={identity.candidateName} onChange={(event) => setIdentity((current) => ({ ...current, candidateName: event.target.value }))} className="h-12 rounded-xl" placeholder={t("Your full name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-phone">{t("Phone number")}</Label>
              <div className="relative"><Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input id="candidate-phone" autoComplete="tel" inputMode="tel" value={identity.phone} onChange={(event) => setIdentity((current) => ({ ...current, phone: event.target.value }))} className="h-12 rounded-xl pl-10" placeholder="(256) 555-0123" /></div>
            </div>
            <div className="space-y-2">
              <Label id="restaurant-concept-label" htmlFor="restaurant-concept">{t("Restaurant type")}</Label>
              <Button
                type="button"
                variant="outline"
                id="restaurant-concept"
                role="combobox"
                aria-labelledby="restaurant-concept-label restaurant-concept"
                aria-expanded={restaurantPickerOpen}
                onClick={() => setRestaurantPickerOpen(true)}
                className="h-12 w-full justify-between rounded-xl border-slate-200 bg-white px-4 text-left text-sm font-normal text-slate-900 shadow-xs hover:bg-white focus-visible:border-cyan-500 focus-visible:ring-cyan-100"
              >
                <span className="truncate">{selectedRestaurantConcept?.label || t("Choose a restaurant type")}</span>
                <ChevronsUpDown className="size-4 shrink-0 text-slate-400" />
              </Button>
              <CommandDialog
                open={restaurantPickerOpen}
                onOpenChange={setRestaurantPickerOpen}
                title={t("Choose a restaurant type")}
                description={t("Search by restaurant type or browse the alphabetical categories.")}
                className="max-h-[min(88vh,720px)] w-[calc(100%-1.5rem)] max-w-2xl rounded-2xl"
              >
                <div className="border-b border-slate-100 px-4 py-4 pr-12">
                  <p className="text-base font-black text-slate-950">{t("Choose a restaurant type")}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{t("Search by restaurant type or browse the alphabetical categories.")}</p>
                </div>
                <CommandInput placeholder={t("Search restaurant type or category...")} className="text-base sm:text-sm" />
                <CommandList className="max-h-[min(62vh,520px)] px-1 pb-2">
                  <CommandEmpty>{t("No restaurant type found.")}</CommandEmpty>
                  {sortedRestaurantGroups.map((group) => (
                    <CommandGroup key={group.id} heading={t(group.label)} className="[&_[cmdk-group-heading]]:sticky [&_[cmdk-group-heading]]:top-0 [&_[cmdk-group-heading]]:z-10 [&_[cmdk-group-heading]]:bg-white [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-cyan-800">
                      {group.concepts.map((concept) => (
                        <CommandItem
                          key={concept.id}
                          value={`${t(group.label)} ${concept.label}`}
                          onSelect={() => {
                            setIdentity((current) => ({ ...current, restaurantConcept: concept.id as RestaurantConceptId }));
                            setRestaurantPickerOpen(false);
                          }}
                          className="min-h-11 rounded-lg px-3 py-2.5 text-sm"
                        >
                          <Check className={`size-4 ${identity.restaurantConcept === concept.id ? "opacity-100 text-cyan-700" : "opacity-0"}`} />
                          <span>{concept.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </CommandDialog>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label><span className="mr-1 text-cyan-700">1.</span> {t("Job family")}</Label>
                <Select
                  value={identity.jobFamily}
                  onValueChange={(value) => {
                    const family = jobFamilies.find((item) => item.id === value) || jobFamilies[0];
                    const firstPosition = [...family.positions].sort((left, right) => collator.compare(t(left.label), t(right.label)))[0];
                    setIdentity((current) => ({
                      ...current,
                      jobFamily: family.id,
                      role: firstPosition.id as CandidateRole,
                    }));
                  }}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[min(60vh,420px)]">{sortedJobFamilies.map((family) => <SelectItem key={family.id} value={family.id}>{t(family.label)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label><span className="mr-1 text-cyan-700">2.</span> {t("Position requested")}</Label>
                <Select value={identity.role} onValueChange={(value) => setIdentity((current) => ({ ...current, role: value as CandidateRole }))}>
                  <SelectTrigger className="h-12 w-full rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[min(60vh,420px)]">{sortedPositions.map((position) => <SelectItem key={position.id} value={position.id}>{t(position.label)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("Experience level")}</Label>
              <Select value={identity.experienceLevel} onValueChange={(value) => setIdentity((current) => ({ ...current, experienceLevel: value as ExperienceLevel }))}>
                <SelectTrigger className="h-12 w-full rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(experienceLevelLabels).map(([value, label]) => <SelectItem key={value} value={value}>{t(label)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <ErrorMessage message={error} />
            <Button onClick={beginProfile} className="h-12 w-full rounded-xl bg-[#e7512f] text-base font-bold text-white hover:bg-[#d94625]">
              {t("Continue to employment profile")} <ArrowRight className="size-4" />
            </Button>
            <p className="text-xs leading-5 text-slate-500">{t("If you need a reasonable accommodation or another accessible format for this assessment, ask the hiring manager before beginning.")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "biodata") {
    const roleProfile = positionForRole(identity.role).profile;
    const ageText = roleProfile === "bartender"
      ? t("I am at least 21 years old for Bartender duties.")
      : roleProfile === "server" && positionRequiresAlcoholTraining(identity.role)
        ? t("I am at least 18 years old for alcohol-serving Server duties (subject to license/RVP verification).")
        : roleProfile === "assistant_manager"
          ? t("I meet the legal minimum age requirements for the Assistant Manager duties offered, including any alcohol duties assigned.")
          : t("I meet the legal minimum age requirements for the {role} duties offered.", { role: t(roleLabels[identity.role]) });
    return (
      <div className="mx-auto max-w-5xl">
        <Card className="border-slate-200 bg-white shadow-[0_22px_70px_rgba(8,32,48,.1)]">
          <CardHeader className="border-b border-slate-100 px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-800">{t("Step 1 of 2")}</Badge>
                <CardTitle className="mt-3 text-2xl font-black tracking-tight text-slate-950">{t("Employment profile")}</CardTitle>
                <p className="mt-1 text-sm text-slate-500">{identity.candidateName} · {t(roleLabels[identity.role])}</p>
              </div>
              <p className="max-w-sm text-sm leading-5 text-slate-500">{t("Only job-related information is requested. Do not enter an SSN, medical information, or other sensitive records.")}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 px-5 py-7 sm:px-8">
            <section>
              <h3 className="section-kicker">{t("Contact & experience")}</h3>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="bio-email">{t("Email")} <span className="font-normal text-slate-400">{t("(optional)")}</span></Label><Input id="bio-email" type="email" autoComplete="email" value={biodata.email} onChange={(event) => setBiodata((current) => ({ ...current, email: event.target.value }))} className="h-11 rounded-xl" placeholder="name@example.com" /></div>
                <div className="space-y-2"><Label htmlFor="bio-location">{t("City and state")}</Label><Input id="bio-location" autoComplete="address-level2" value={biodata.cityState} onChange={(event) => setBiodata((current) => ({ ...current, cityState: event.target.value }))} className="h-11 rounded-xl" placeholder="Huntsville, Alabama" /></div>
                <div className="space-y-2"><Label htmlFor="bio-start">{t("Available start date")}</Label><Input id="bio-start" type="date" value={biodata.availableStartDate} onChange={(event) => setBiodata((current) => ({ ...current, availableStartDate: event.target.value }))} className="h-11 rounded-xl" /></div>
                <div className="space-y-2"><Label>{t("Restaurant experience")}</Label><div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">{t(experienceLevelLabels[biodata.experienceLevel])}</div></div>
                <div className="space-y-2"><Label htmlFor="bio-employer">{t("Most recent employer")} <span className="font-normal text-slate-400">{t("(optional)")}</span></Label><Input id="bio-employer" value={biodata.mostRecentEmployer} onChange={(event) => setBiodata((current) => ({ ...current, mostRecentEmployer: event.target.value }))} className="h-11 rounded-xl" /></div>
                <div className="space-y-2"><Label htmlFor="bio-role">{t("Most recent role")} <span className="font-normal text-slate-400">{t("(optional)")}</span></Label><Input id="bio-role" value={biodata.mostRecentRole} onChange={(event) => setBiodata((current) => ({ ...current, mostRecentRole: event.target.value }))} className="h-11 rounded-xl" /></div>
                <div className="space-y-2 md:col-span-2"><Label htmlFor="bio-leaving">{t("Reason for leaving / looking for a new role")} <span className="font-normal text-slate-400">{t("(optional)")}</span></Label><Textarea id="bio-leaving" value={biodata.reasonLeaving} onChange={(event) => setBiodata((current) => ({ ...current, reasonLeaving: event.target.value }))} className="min-h-24 rounded-xl" maxLength={600} /></div>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-7">
              <h3 className="section-kicker">{t("Availability & qualifications")}</h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div className="space-y-3 md:col-span-2"><Label>{t("Days available")}</Label><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{days.map((day) => { const checked = biodata.availableDays.includes(day); return <label key={day} className={`check-tile ${checked ? "check-tile-active" : ""}`}><Checkbox checked={checked} onCheckedChange={(value) => toggleList("availableDays", day, value === true)} /><span>{t(day).slice(0, locale.startsWith("zh") ? undefined : 3)}</span></label>; })}</div></div>
                <div className="space-y-3"><Label>{t("Shifts available")}</Label><div className="space-y-2">{shifts.map((shift) => { const checked = biodata.availableShifts.includes(shift); return <label key={shift} className={`check-row ${checked ? "check-row-active" : ""}`}><Checkbox checked={checked} onCheckedChange={(value) => toggleList("availableShifts", shift, value === true)} /><span>{t(shift)}</span></label>; })}</div></div>
                <div className="space-y-5">
                  <div className="space-y-2"><Label>{t("Desired weekly hours")}</Label><Select value={biodata.hoursDesired} onValueChange={(value) => setBiodata((current) => ({ ...current, hoursDesired: value as CandidateBiodata["hoursDesired"] }))}><SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder={t("Select hours")} /></SelectTrigger><SelectContent><SelectItem value="under_20">{t("Under 20 hours")}</SelectItem><SelectItem value="20_30">{t("20–30 hours")}</SelectItem><SelectItem value="30_40">{t("30–40 hours")}</SelectItem><SelectItem value="over_40">{t("More than 40 hours")}</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>{t("Customer-facing English comfort")}</Label><Select value={biodata.englishComfort} onValueChange={(value) => setBiodata((current) => ({ ...current, englishComfort: value as CandidateBiodata["englishComfort"] }))}><SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder={t("Select level")} /></SelectTrigger><SelectContent><SelectItem value="basic">{t("Basic")}</SelectItem><SelectItem value="conversational">{t("Conversational")}</SelectItem><SelectItem value="professional">{t("Professional working level")}</SelectItem><SelectItem value="fluent">{t("Fluent")}</SelectItem></SelectContent></Select></div>
                  {positionRequiresAlcoholTraining(identity.role) && <div className="space-y-2"><Label>{t("Alcohol-service training")}</Label><Select value={biodata.alcoholTraining} onValueChange={(value) => setBiodata((current) => ({ ...current, alcoholTraining: value as CandidateBiodata["alcoholTraining"] }))}><SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder={t("Select status")} /></SelectTrigger><SelectContent><SelectItem value="yes">{t("Completed / current")}</SelectItem><SelectItem value="in_progress">{t("In progress")}</SelectItem><SelectItem value="no">{t("Not completed")}</SelectItem></SelectContent></Select></div>}
                </div>
                <div className="space-y-3 md:col-span-2"><Label>{t("Are you legally authorized to work in the United States?")}</Label><RadioGroup value={biodata.authorizedToWork === null ? "" : biodata.authorizedToWork ? "yes" : "no"} onValueChange={(value) => setBiodata((current) => ({ ...current, authorizedToWork: value === "yes" }))} className="grid gap-2 sm:grid-cols-2"><label className="answer-option"><RadioGroupItem value="yes" /> {t("Yes")}</label><label className="answer-option"><RadioGroupItem value="no" /> {t("No")}</label></RadioGroup></div>
                <div className="space-y-3 md:col-span-2"><Label>{ageText}</Label><RadioGroup value={biodata.meetsAgeRequirement === null ? "" : biodata.meetsAgeRequirement ? "yes" : "no"} onValueChange={(value) => setBiodata((current) => ({ ...current, meetsAgeRequirement: value === "yes" }))} className="grid gap-2 sm:grid-cols-2"><label className="answer-option"><RadioGroupItem value="yes" /> {t("Yes")}</label><label className="answer-option"><RadioGroupItem value="no" /> {t("No")}</label></RadioGroup></div>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-7">
              <h3 className="section-kicker">{t("About your interest")}</h3>
              <div className="mt-4 grid gap-5">
                <div className="space-y-2"><Label htmlFor="bio-why">{t("Why would you like to work with us?")} <span className="font-normal text-slate-400">{t("(optional)")}</span></Label><Textarea id="bio-why" value={biodata.whyJoin} onChange={(event) => setBiodata((current) => ({ ...current, whyJoin: event.target.value }))} className="min-h-24 rounded-xl" maxLength={800} /></div>
                <div className="space-y-2"><Label htmlFor="bio-example">{t("Briefly describe a time you helped a customer or teammate.")} <span className="font-normal text-slate-400">{t("(optional)")}</span></Label><Textarea id="bio-example" value={biodata.serviceExample} onChange={(event) => setBiodata((current) => ({ ...current, serviceExample: event.target.value }))} className="min-h-28 rounded-xl" maxLength={1000} /></div>
              </div>
            </section>
            <ErrorMessage message={error} />
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => { setError(""); setStage("entry"); }} className="h-11 rounded-xl"><ArrowLeft className="size-4" /> {t("Back")}</Button>
              <Button onClick={startTest} disabled={loading} className="h-11 rounded-xl bg-[#e7512f] px-6 font-bold text-white hover:bg-[#d94625]">{loading ? <Loader2 className="size-4 animate-spin" /> : <ClipboardList className="size-4" />} {t("Start 75-question assessment")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="flex min-h-72 items-center justify-center text-slate-500"><Loader2 className="mr-2 size-5 animate-spin" /> {t("Loading assessment…")}</div>;
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
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">{currentIndex < 30 ? t("Part 1 · Work Psychology & Judgment") : t("Part 2 · {role} Technical", { role: t(roleLabels[identity.role]) })}</p>
                  <p className="mt-1 text-sm font-medium text-slate-300">{t("Question {current} of {total}", { current: currentIndex + 1, total: questions.length })}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-white/15 bg-white/10 text-white backdrop-blur-sm">{t(categoryLabels[currentQuestion.category])}</Badge>
            </div>
            <Progress value={((currentIndex + 1) / questions.length) * 100} className="quiz-main-progress mt-5 h-2.5 bg-white/10 [&_[data-slot=progress-indicator]]:bg-[linear-gradient(90deg,#5eeaf2,#ff805f)]" />
          </div>
          <CardContent className="quiz-question-content px-5 py-7 sm:px-8 sm:py-9">
            {currentIndex < 30 ? <div className="mb-6 flex gap-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-950"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-violet-700" /><span><strong>{t("Work-psychology statement.")}</strong> {t("Answer based on how you usually behave at work—not the answer that merely sounds ideal.")}</span></div> : currentIndex === 30 ? <div className="mb-6 flex gap-3 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-950"><BriefcaseBusiness className="mt-0.5 size-5 shrink-0 text-cyan-700" /><span><strong>{t("Technical section starts here.")}</strong> {t("The next 45 questions are tailored to the restaurant concept, position, and experience level you selected.")}</span></div> : null}
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
              <Button variant="outline" disabled={currentIndex === 0} onClick={() => goToQuestion(currentIndex - 1)} className="h-11 rounded-xl"><ArrowLeft className="size-4" /> {t("Previous")}</Button>
              {currentIndex < questions.length - 1 ? (
                <Button disabled={!answers[currentQuestion.id]} onClick={() => goToQuestion(currentIndex + 1)} className="h-11 rounded-xl bg-[#0b6f79] px-6 font-bold text-white shadow-[0_5px_0_#054a51] hover:bg-[#085d66] active:translate-y-1 active:shadow-none disabled:shadow-none">{t("Next question")} <ArrowRight className="size-4" /></Button>
              ) : (
                <Button disabled={!answers[currentQuestion.id]} onClick={() => setConfirmOpen(true)} className="h-11 rounded-xl bg-[#e7512f] px-6 font-bold text-white shadow-[0_5px_0_#b7371d] hover:bg-[#d94625] active:translate-y-1 active:shadow-none disabled:shadow-none">{t("Review & submit")} <CheckCircle2 className="size-4" /></Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
        <Card className="quiz-progress-card border-slate-700 bg-[#071f2f] text-white shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.15em] text-cyan-300">{t("Progress")}</p><p className="mt-1 text-3xl font-black">{answeredCount}<span className="text-base text-slate-400"> / 75</span></p></div><Clock3 className="size-6 text-cyan-300" /></div>
            <div className="mt-5 space-y-4">{groupedProgress.map((group) => <div key={group.label}><div className="mb-1.5 flex justify-between gap-2 text-xs"><span className="text-slate-300">{group.label}</span><span className="font-bold">{group.answered}/{group.end - group.start}</span></div><Progress value={(group.answered / (group.end - group.start)) * 100} className="h-1.5 bg-white/10 [&_[data-slot=progress-indicator]]:bg-cyan-300" /></div>)}</div>
          </CardContent>
        </Card>
        <Card className="quiz-navigator-card border-slate-200 bg-white">
          <CardContent className="p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-slate-500">{t("Question navigator")}</p>
            <div className="question-grid">{questions.map((question, index) => { const locked = index > unlockedThrough; return <button key={question.id} type="button" disabled={locked} onClick={() => goToQuestion(index)} aria-label={locked ? t("Question {number} locked until earlier questions are answered", { number: index + 1 }) : t("Go to question {number}", { number: index + 1 })} aria-current={index === currentIndex ? "step" : undefined} className={`${answers[question.id] ? "question-done" : ""} ${index === currentIndex ? "question-current" : ""} ${locked ? "question-locked" : ""}`}>{index + 1}</button>; })}</div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{t("Questions unlock in order. Finish each answer before moving forward.")}</p>
          </CardContent>
        </Card>
      </aside>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-2xl font-black">{t("Submit your assessment?")}</DialogTitle><DialogDescription className="leading-6">{t("You answered {answered} of {total} questions. After submission, answers cannot be changed.", { answered: answeredCount, total: questions.length })}</DialogDescription></DialogHeader>
          <div className={`rounded-xl border p-4 text-sm ${allAnswered ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{allAnswered ? t("All 75 questions are complete.") : t("{count} question(s) still need an answer.", { count: questions.length - answeredCount })}</div>
          <DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)} className="rounded-xl">{t("Keep reviewing")}</Button><Button onClick={submitAssessment} disabled={!allAnswered || loading} className="rounded-xl bg-[#e7512f] font-bold text-white hover:bg-[#d94625]">{loading && <Loader2 className="size-4 animate-spin" />} {t("Submit final")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
