import type {
  CandidateBiodata,
  ManagerAccount,
  StaffSession,
  SubmissionDetail,
  SubmissionSummary,
} from "@/lib/client-types";
import {
  categoryLabels,
  getAssessmentQuestions,
  isCandidateRole,
  roleLabels,
  TEST_VERSION,
  toPublicQuestion,
  type CandidateRole,
  type QuestionCategory,
} from "@/lib/question-bank";
import { buildDetailedAnalysis, scoreSubmission } from "@/lib/scoring";
import {
  assertFirebaseConfigured,
  firebaseConfig,
  normalizeStaffUsername,
  ownerIdentity,
  usernameToAuthEmail,
} from "@/github-src/firebase-config";

const firebaseVersion = "12.18.0";
const firebaseBase = `https://www.gstatic.com/firebasejs/${firebaseVersion}`;

type FirebaseUser = {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
};

type FirebaseAuth = {
  currentUser: FirebaseUser | null;
  authStateReady: () => Promise<void>;
};

type FirebaseUserCredential = {
  user: FirebaseUser;
};

type FirestoreTimestamp = {
  toDate?: () => Date;
};

type FirestoreDocument = {
  id: string;
  exists: () => boolean;
  data: () => Record<string, unknown>;
};

type FirestoreQuerySnapshot = {
  docs: FirestoreDocument[];
};

type FirebaseRuntime = {
  auth: FirebaseAuth;
  provisioningAuth: FirebaseAuth;
  db: unknown;
  signInAnonymously: (auth: FirebaseAuth) => Promise<unknown>;
  signInWithEmailAndPassword: (auth: FirebaseAuth, email: string, password: string) => Promise<FirebaseUserCredential>;
  createUserWithEmailAndPassword: (auth: FirebaseAuth, email: string, password: string) => Promise<FirebaseUserCredential>;
  signOut: (auth: FirebaseAuth) => Promise<void>;
  collection: (db: unknown, path: string) => unknown;
  doc: (db: unknown, path: string, id: string) => unknown;
  getDoc: (reference: unknown) => Promise<FirestoreDocument>;
  getDocs: (reference: unknown) => Promise<FirestoreQuerySnapshot>;
  setDoc: (reference: unknown, data: Record<string, unknown>) => Promise<void>;
  updateDoc: (reference: unknown, data: Record<string, unknown>) => Promise<void>;
  query: (reference: unknown, ...constraints: unknown[]) => unknown;
  orderBy: (field: string, direction: "asc" | "desc") => unknown;
  limit: (count: number) => unknown;
  onSnapshot: (
    reference: unknown,
    next: (snapshot: FirestoreQuerySnapshot) => void,
    error?: (error: unknown) => void,
  ) => () => void;
  serverTimestamp: () => unknown;
};

type StoredSubmission = {
  id: string;
  candidateName: string;
  phone: string;
  role: CandidateRole;
  biodata: CandidateBiodata;
  answers: Record<string, string>;
  durationSeconds: number;
  testVersion: string;
  submittedAt: string;
};

const alcoholTrainingRoles = new Set<CandidateRole>(["server", "bartender", "assistant_manager"]);
const allowedExperience = new Set(["none", "under_1", "1_2", "3_5", "over_5"]);
const allowedEnglish = new Set(["basic", "conversational", "professional", "fluent"]);
const allowedHours = new Set(["under_20", "20_30", "30_40", "over_40"]);
const allowedDays = new Set(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
const allowedShifts = new Set(["Lunch", "Dinner", "Double / Long Shift"]);
const allowedTraining = new Set(["not_applicable", "yes", "no", "in_progress"]);
const loginAttemptKey = "fred-hiring-staff-login-attempts";

let runtime: FirebaseRuntime;
let liveRows: StoredSubmission[] | null = null;
let stopLiveListener: (() => void) | null = null;
let currentStaffSession: StaffSession = {
  authenticated: false,
  role: null,
  displayName: null,
  username: null,
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function signedOutSession(): StaffSession {
  return { authenticated: false, role: null, displayName: null, username: null };
}

async function resolveStaffSession(): Promise<StaffSession> {
  const user = runtime.auth.currentUser;
  if (!user || user.isAnonymous || !user.email) {
    currentStaffSession = signedOutSession();
    return currentStaffSession;
  }

  if (user.email.toLowerCase() === ownerIdentity.email.toLowerCase()) {
    currentStaffSession = {
      authenticated: true,
      role: "owner",
      displayName: ownerIdentity.displayName,
      username: ownerIdentity.username,
    };
    return currentStaffSession;
  }

  try {
    const staffDocument = await runtime.getDoc(runtime.doc(runtime.db, "staff", user.uid));
    if (!staffDocument.exists()) {
      currentStaffSession = signedOutSession();
      return currentStaffSession;
    }
    const data = staffDocument.data();
    const validManager = data.role === "manager"
      && data.status === "active"
      && typeof data.authEmail === "string"
      && data.authEmail.toLowerCase() === user.email.toLowerCase()
      && typeof data.displayName === "string"
      && typeof data.username === "string";
    currentStaffSession = validManager
      ? {
          authenticated: true,
          role: "manager",
          displayName: text(data.displayName, 80),
          username: text(data.username, 32),
        }
      : signedOutSession();
    return currentStaffSession;
  } catch {
    currentStaffSession = signedOutSession();
    return currentStaffSession;
  }
}

async function requireStaff() {
  const session = await resolveStaffSession();
  return session.authenticated ? session : null;
}

async function requireOwner() {
  const session = await resolveStaffSession();
  return session.authenticated && session.role === "owner" ? session : null;
}

function timestampToIso(value: unknown, fallback: unknown) {
  if (value && typeof value === "object") {
    const date = (value as FirestoreTimestamp).toDate?.();
    if (date && !Number.isNaN(date.valueOf())) return date.toISOString();
  }
  if (typeof value === "string" && !Number.isNaN(new Date(value).valueOf())) return new Date(value).toISOString();
  if (typeof fallback === "string" && !Number.isNaN(new Date(fallback).valueOf())) return new Date(fallback).toISOString();
  return new Date(0).toISOString();
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseBiodata(value: unknown, role: CandidateRole): CandidateBiodata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Complete the employment information before submitting.");
  }
  const raw = value as Record<string, unknown>;
  const email = text(raw.email, 160);
  const cityState = text(raw.cityState, 120);
  const availableStartDate = text(raw.availableStartDate, 10);
  const restaurantExperience = text(raw.restaurantExperience, 20);
  const englishComfort = text(raw.englishComfort, 20);
  const hoursDesired = text(raw.hoursDesired, 20);
  const alcoholTraining = text(raw.alcoholTraining, 20);
  const availableDays = Array.isArray(raw.availableDays)
    ? raw.availableDays.filter((item): item is string => typeof item === "string" && allowedDays.has(item))
    : [];
  const availableShifts = Array.isArray(raw.availableShifts)
    ? raw.availableShifts.filter((item): item is string => typeof item === "string" && allowedShifts.has(item))
    : [];

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address or leave it blank.");
  if (cityState.length < 2) throw new Error("Enter your city and state.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(availableStartDate)) throw new Error("Choose your available start date.");
  if (!allowedExperience.has(restaurantExperience)) throw new Error("Choose your restaurant experience.");
  if (!allowedEnglish.has(englishComfort)) throw new Error("Choose your customer-facing English comfort level.");
  if (!allowedHours.has(hoursDesired)) throw new Error("Choose your desired weekly hours.");
  if (!availableDays.length || !availableShifts.length) throw new Error("Choose your available days and shifts.");
  if (typeof raw.authorizedToWork !== "boolean" || typeof raw.meetsAgeRequirement !== "boolean") {
    throw new Error("Complete the work-eligibility confirmations.");
  }
  if (!allowedTraining.has(alcoholTraining)) throw new Error("Choose your alcohol-training status.");
  if (alcoholTrainingRoles.has(role) === (alcoholTraining === "not_applicable")) {
    throw new Error(alcoholTrainingRoles.has(role)
      ? "Choose the alcohol-training status for this position."
      : "Alcohol training should be marked not applicable for this position.");
  }

  return {
    email,
    cityState,
    availableStartDate,
    restaurantExperience: restaurantExperience as CandidateBiodata["restaurantExperience"],
    mostRecentEmployer: text(raw.mostRecentEmployer, 120),
    mostRecentRole: text(raw.mostRecentRole, 120),
    reasonLeaving: text(raw.reasonLeaving, 600),
    englishComfort: englishComfort as CandidateBiodata["englishComfort"],
    availableDays,
    availableShifts,
    hoursDesired: hoursDesired as CandidateBiodata["hoursDesired"],
    authorizedToWork: raw.authorizedToWork,
    meetsAgeRequirement: raw.meetsAgeRequirement,
    alcoholTraining: alcoholTraining as CandidateBiodata["alcoholTraining"],
    whyJoin: text(raw.whyJoin, 800),
    serviceExample: text(raw.serviceExample, 1000),
  };
}

function requestBody(input: RequestInfo | URL, init?: RequestInit) {
  if (typeof init?.body === "string") return JSON.parse(init.body) as Record<string, unknown>;
  if (input instanceof Request) return input.clone().json() as Promise<Record<string, unknown>>;
  return {};
}

function friendlyFirebaseError(error: unknown, fallback: string) {
  const code = error && typeof error === "object" && "code" in error ? String((error as { code: unknown }).code) : "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Username or password is incorrect.";
  }
  if (code.includes("email-already-in-use")) return "That username is already in use.";
  if (code.includes("weak-password")) return "Use a password with at least 8 characters.";
  if (code.includes("too-many-requests")) return "Too many attempts. Wait and try again.";
  if (code.includes("permission-denied")) return "Secure database access was denied. Please contact the administrator.";
  if (code.includes("network-request-failed") || code.includes("unavailable")) return "Network connection failed. Please check the connection and try again.";
  return fallback;
}

function recentLoginAttempts() {
  const cutoff = Date.now() - 15 * 60 * 1000;
  try {
    const values = JSON.parse(localStorage.getItem(loginAttemptKey) || "[]") as unknown;
    return Array.isArray(values)
      ? values.filter((value): value is number => typeof value === "number" && value >= cutoff)
      : [];
  } catch {
    return [];
  }
}

function recordFailedLogin() {
  localStorage.setItem(loginAttemptKey, JSON.stringify([...recentLoginAttempts(), Date.now()]));
}

function clearFailedLogins() {
  localStorage.removeItem(loginAttemptKey);
}

function documentToStored(document: FirestoreDocument): StoredSubmission | null {
  const data = document.data();
  if (!isCandidateRole(data.role)) return null;
  if (!data.biodata || typeof data.biodata !== "object" || Array.isArray(data.biodata)) return null;
  if (!data.answers || typeof data.answers !== "object" || Array.isArray(data.answers)) return null;
  const rawAnswers = data.answers as Record<string, unknown>;
  const answers = Object.fromEntries(
    Object.entries(rawAnswers).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
  return {
    id: document.id,
    candidateName: text(data.candidateName, 100),
    phone: text(data.phone, 40),
    role: data.role,
    biodata: data.biodata as CandidateBiodata,
    answers,
    durationSeconds: Math.max(0, Math.min(4 * 60 * 60, Math.round(Number(data.durationSeconds) || 0))),
    testVersion: text(data.testVersion, 30),
    submittedAt: timestampToIso(data.submittedAt, data.createdAtClient),
  };
}

function summaryFromStored(stored: StoredSubmission): SubmissionSummary {
  try {
    const score = scoreSubmission(stored.role, stored.answers);
    return {
      id: stored.id,
      candidateName: stored.candidateName,
      phone: stored.phone,
      role: stored.role,
      fitPercentage: score.fitPercentage,
      outcome: score.outcome,
      criticalMisses: score.criticalMisses,
      durationSeconds: stored.durationSeconds,
      submittedAt: stored.submittedAt,
    };
  } catch {
    return {
      id: stored.id,
      candidateName: stored.candidateName || "Invalid submission",
      phone: stored.phone,
      role: stored.role,
      fitPercentage: 1,
      outcome: "not_pass",
      criticalMisses: 1,
      durationSeconds: stored.durationSeconds,
      submittedAt: stored.submittedAt,
    };
  }
}

function detailFromStored(stored: StoredSubmission): SubmissionDetail {
  const score = scoreSubmission(stored.role, stored.answers);
  const categories = Object.keys(score.categoryScores) as QuestionCategory[];
  return {
    ...summaryFromStored(stored),
    roleLabel: roleLabels[stored.role],
    totalScore: score.totalScore,
    maxScore: score.maxScore,
    testVersion: stored.testVersion,
    biodata: stored.biodata,
    categoryScores: categories.map((category) => ({
      category,
      label: categoryLabels[category],
      ...score.categoryScores[category],
    })),
    answers: score.answerDetails,
    analysis: buildDetailedAnalysis(score),
  };
}

function submissionsQuery() {
  return runtime.query(
    runtime.collection(runtime.db, "submissions"),
    runtime.orderBy("submittedAt", "desc"),
    runtime.limit(200),
  );
}

function rowsFromSnapshot(snapshot: FirestoreQuerySnapshot) {
  return snapshot.docs
    .map(documentToStored)
    .filter((row): row is StoredSubmission => row !== null);
}

function beginLiveResults() {
  if (!currentStaffSession.authenticated || stopLiveListener) return;
  stopLiveListener = runtime.onSnapshot(
    submissionsQuery(),
    (snapshot) => {
      liveRows = rowsFromSnapshot(snapshot);
      window.dispatchEvent(new Event("juicy-submissions-updated"));
    },
    () => {
      liveRows = null;
      window.dispatchEvent(new Event("juicy-submissions-updated"));
    },
  );
}

function endLiveResults() {
  stopLiveListener?.();
  stopLiveListener = null;
  liveRows = null;
}

async function loadStoredSubmissions() {
  if (liveRows) return liveRows;
  return rowsFromSnapshot(await runtime.getDocs(submissionsQuery()));
}

async function handleQuestions(url: URL) {
  const role = url.searchParams.get("role");
  if (!isCandidateRole(role)) return json({ error: "Choose a valid position." }, 400);
  const questions = getAssessmentQuestions(role).map((question) => ({
    ...toPublicQuestion(question),
    options: shuffle(toPublicQuestion(question).options),
  }));
  return json({ role, roleLabel: roleLabels[role], version: TEST_VERSION, questions });
}

async function handleSubmission(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const body = await requestBody(input, init);
    if (body.website) return json({ received: true });
    const candidateName = text(body.candidateName, 100).replace(/\s+/g, " ");
    const phone = text(body.phone, 40).replace(/[^0-9+().\-\s]/g, "");
    const phoneDigits = phone.replace(/\D/g, "");
    const submissionKey = text(body.submissionKey, 80);
    if (candidateName.length < 2) return json({ error: "Enter your full name." }, 400);
    if (phoneDigits.length < 7 || phoneDigits.length > 15) return json({ error: "Enter a valid phone number." }, 400);
    if (!isCandidateRole(body.role)) return json({ error: "Choose a valid position." }, 400);
    if (!/^[0-9a-f-]{20,80}$/i.test(submissionKey)) return json({ error: "This test session is invalid. Please restart." }, 400);
    if (!body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) return json({ error: "Answers are missing." }, 400);
    const answers = Object.fromEntries(
      Object.entries(body.answers).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
    scoreSubmission(body.role, answers);
    const biodata = parseBiodata(body.biodata, body.role);
    const durationSeconds = Math.max(0, Math.min(4 * 60 * 60, Math.round(Number(body.durationSeconds) || 0)));
    if (!runtime.auth.currentUser) await runtime.signInAnonymously(runtime.auth);
    await runtime.setDoc(runtime.doc(runtime.db, "submissions", submissionKey), {
      submissionKey,
      creatorUid: runtime.auth.currentUser?.uid || "",
      candidateName,
      phone,
      role: body.role,
      biodata,
      answers,
      durationSeconds,
      testVersion: TEST_VERSION,
      createdAtClient: new Date().toISOString(),
      submittedAt: runtime.serverTimestamp(),
    });
    return json({ received: true, submissionId: submissionKey });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The test could not be submitted.";
    return json({ error: friendlyFirebaseError(error, message) }, 400);
  }
}

async function handleManagerLogin(input: RequestInfo | URL, init?: RequestInit) {
  const attempts = recentLoginAttempts();
  if (attempts.length >= 5) return json({ error: "Too many attempts. Wait 15 minutes and try again." }, 429);
  try {
    const body = await requestBody(input, init);
    const username = text(body.username, 80);
    const password = text(body.password ?? body.passcode, 160);
    const authEmail = username.toLowerCase() === ownerIdentity.username.toLowerCase()
      ? ownerIdentity.email
      : usernameToAuthEmail(username);
    await runtime.signInWithEmailAndPassword(runtime.auth, authEmail, password);
    const session = await resolveStaffSession();
    if (!session.authenticated) {
      await runtime.signOut(runtime.auth);
      await runtime.signInAnonymously(runtime.auth);
      throw new Error("Username or password is incorrect.");
    }
    clearFailedLogins();
    beginLiveResults();
    return json(session);
  } catch (error) {
    recordFailedLogin();
    return json({ error: friendlyFirebaseError(error, "Username or password is incorrect.") }, 401);
  }
}

async function handleManagerList() {
  if (!await requireStaff()) return json({ error: "Unauthorized" }, 401);
  try {
    beginLiveResults();
    const submissions = (await loadStoredSubmissions()).map(summaryFromStored);
    return json({ submissions });
  } catch (error) {
    return json({ error: friendlyFirebaseError(error, "Results could not be loaded.") }, 503);
  }
}

async function handleManagerDetail(id: string) {
  if (!await requireStaff()) return json({ error: "Unauthorized" }, 401);
  try {
    const document = await runtime.getDoc(runtime.doc(runtime.db, "submissions", id));
    if (!document.exists()) return json({ error: "Result not found." }, 404);
    const stored = documentToStored(document);
    if (!stored) return json({ error: "Stored result is invalid." }, 422);
    return json({ submission: detailFromStored(stored) });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("answer")
      ? "The stored answer set could not be verified against this test version."
      : friendlyFirebaseError(error, "Result detail could not be loaded.");
    return json({ error: message }, 422);
  }
}

function managerAccountFromDocument(document: FirestoreDocument): ManagerAccount | null {
  const data = document.data();
  if (data.role !== "manager") return null;
  if (data.status !== "active" && data.status !== "disabled" && data.status !== "removed") return null;
  const username = text(data.username, 32);
  const displayName = text(data.displayName, 80);
  if (!username || !displayName) return null;
  return {
    id: document.id,
    username,
    displayName,
    status: data.status,
    createdAt: timestampToIso(data.createdAt, data.createdAt),
    updatedAt: timestampToIso(data.updatedAt, data.createdAt),
  };
}

function managerAccountsQuery() {
  return runtime.query(
    runtime.collection(runtime.db, "staff"),
    runtime.orderBy("createdAt", "desc"),
    runtime.limit(100),
  );
}

async function handleOwnerManagerList() {
  if (!await requireOwner()) return json({ error: "Owner access required." }, 403);
  try {
    const managers = (await runtime.getDocs(managerAccountsQuery())).docs
      .map(managerAccountFromDocument)
      .filter((account): account is ManagerAccount => account !== null && account.status !== "removed");
    return json({ managers });
  } catch (error) {
    return json({ error: friendlyFirebaseError(error, "Manager accounts could not be loaded.") }, 503);
  }
}

async function handleOwnerManagerCreate(input: RequestInfo | URL, init?: RequestInit) {
  const owner = await requireOwner();
  if (!owner) return json({ error: "Owner access required." }, 403);
  let createdUser: FirebaseUser | null = null;
  try {
    const body = await requestBody(input, init);
    const username = normalizeStaffUsername(text(body.username, 32));
    const displayName = text(body.displayName, 80).replace(/\s+/g, " ");
    const password = text(body.password, 160);
    const authEmail = usernameToAuthEmail(username);
    if (displayName.length < 2) return json({ error: "Enter the manager's display name." }, 400);
    if (password.length < 8 || password.length > 72) {
      return json({ error: "Temporary password must be 8–72 characters." }, 400);
    }

    await runtime.signOut(runtime.provisioningAuth);
    const credential = await runtime.createUserWithEmailAndPassword(runtime.provisioningAuth, authEmail, password);
    createdUser = credential.user;
    await runtime.setDoc(runtime.doc(runtime.db, "staff", createdUser.uid), {
      uid: createdUser.uid,
      username,
      usernameLower: username,
      authEmail,
      displayName,
      role: "manager",
      status: "active",
      createdAt: runtime.serverTimestamp(),
      updatedAt: runtime.serverTimestamp(),
      createdBy: runtime.auth.currentUser?.uid || ownerIdentity.username,
    });
    const now = new Date().toISOString();
    return json({
      manager: {
        id: createdUser.uid,
        username,
        displayName,
        status: "active",
        createdAt: now,
        updatedAt: now,
      } satisfies ManagerAccount,
    }, 201);
  } catch (error) {
    const fallback = createdUser
      ? "The sign-in account was created, but access setup failed. Use a different username or contact the administrator."
      : "The manager account could not be created.";
    return json({ error: friendlyFirebaseError(error, fallback) }, 400);
  } finally {
    try {
      await runtime.signOut(runtime.provisioningAuth);
    } catch {
      // The provisioning app never controls the Owner session.
    }
  }
}

async function handleOwnerManagerUpdate(id: string, input: RequestInfo | URL, init?: RequestInit) {
  if (!await requireOwner()) return json({ error: "Owner access required." }, 403);
  try {
    const reference = runtime.doc(runtime.db, "staff", id);
    const document = await runtime.getDoc(reference);
    if (!document.exists() || document.data().role !== "manager") return json({ error: "Manager account not found." }, 404);
    const body = await requestBody(input, init);
    const displayName = text(body.displayName, 80).replace(/\s+/g, " ");
    const status = body.status;
    if (displayName.length < 2) return json({ error: "Enter the manager's display name." }, 400);
    if (status !== "active" && status !== "disabled") return json({ error: "Choose a valid account status." }, 400);
    await runtime.updateDoc(reference, {
      displayName,
      status,
      updatedAt: runtime.serverTimestamp(),
    });
    return json({ updated: true });
  } catch (error) {
    return json({ error: friendlyFirebaseError(error, "The manager account could not be updated.") }, 400);
  }
}

async function handleOwnerManagerRemove(id: string) {
  if (!await requireOwner()) return json({ error: "Owner access required." }, 403);
  try {
    const reference = runtime.doc(runtime.db, "staff", id);
    const document = await runtime.getDoc(reference);
    if (!document.exists() || document.data().role !== "manager") return json({ error: "Manager account not found." }, 404);
    await runtime.updateDoc(reference, {
      status: "removed",
      updatedAt: runtime.serverTimestamp(),
    });
    return json({ removed: true });
  } catch (error) {
    return json({ error: friendlyFirebaseError(error, "The manager account could not be removed.") }, 400);
  }
}

async function handleStaticApi(input: RequestInfo | URL, init?: RequestInit) {
  const inputUrl = input instanceof Request ? input.url : input.toString();
  const url = new URL(inputUrl, window.location.href);
  const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (url.pathname === "/api/questions" && method === "GET") return handleQuestions(url);
  if (url.pathname === "/api/submissions" && method === "POST") return handleSubmission(input, init);
  if (url.pathname === "/api/manager/login" && method === "POST") return handleManagerLogin(input, init);
  if (url.pathname === "/api/manager/session" && method === "GET") {
    const session = await resolveStaffSession();
    if (session.authenticated) beginLiveResults();
    return json(session);
  }
  if (url.pathname === "/api/manager/logout" && method === "POST") {
    endLiveResults();
    currentStaffSession = signedOutSession();
    await runtime.signOut(runtime.auth);
    await runtime.signInAnonymously(runtime.auth);
    return json(signedOutSession());
  }
  if (url.pathname === "/api/manager/submissions" && method === "GET") return handleManagerList();
  const detailMatch = url.pathname.match(/^\/api\/manager\/submissions\/([^/]+)$/);
  if (detailMatch && method === "GET") return handleManagerDetail(decodeURIComponent(detailMatch[1]));
  if (url.pathname === "/api/owner/managers" && method === "GET") return handleOwnerManagerList();
  if (url.pathname === "/api/owner/managers" && method === "POST") return handleOwnerManagerCreate(input, init);
  const managerAccountMatch = url.pathname.match(/^\/api\/owner\/managers\/([^/]+)$/);
  if (managerAccountMatch && method === "PATCH") {
    return handleOwnerManagerUpdate(decodeURIComponent(managerAccountMatch[1]), input, init);
  }
  if (managerAccountMatch && method === "DELETE") {
    return handleOwnerManagerRemove(decodeURIComponent(managerAccountMatch[1]));
  }
  return null;
}

async function loadFirebase(): Promise<FirebaseRuntime> {
  const appModuleUrl = `${firebaseBase}/firebase-app.js`;
  const authModuleUrl = `${firebaseBase}/firebase-auth.js`;
  const firestoreModuleUrl = `${firebaseBase}/firebase-firestore.js`;
  const [appModule, authModule, firestoreModule] = await Promise.all([
    import(/* @vite-ignore */ appModuleUrl),
    import(/* @vite-ignore */ authModuleUrl),
    import(/* @vite-ignore */ firestoreModuleUrl),
  ]);
  const app = appModule.initializeApp(firebaseConfig);
  const provisioningApp = appModule.initializeApp(firebaseConfig, "manager-provisioning");
  const auth = authModule.getAuth(app) as FirebaseAuth;
  return {
    auth,
    provisioningAuth: authModule.getAuth(provisioningApp) as FirebaseAuth,
    db: firestoreModule.getFirestore(app),
    signInAnonymously: authModule.signInAnonymously,
    signInWithEmailAndPassword: authModule.signInWithEmailAndPassword,
    createUserWithEmailAndPassword: authModule.createUserWithEmailAndPassword,
    signOut: authModule.signOut,
    collection: firestoreModule.collection,
    doc: firestoreModule.doc,
    getDoc: firestoreModule.getDoc,
    getDocs: firestoreModule.getDocs,
    setDoc: firestoreModule.setDoc,
    updateDoc: firestoreModule.updateDoc,
    query: firestoreModule.query,
    orderBy: firestoreModule.orderBy,
    limit: firestoreModule.limit,
    onSnapshot: firestoreModule.onSnapshot,
    serverTimestamp: firestoreModule.serverTimestamp,
  };
}

export async function installFirebaseApiShim() {
  assertFirebaseConfigured();
  runtime = await loadFirebase();
  await runtime.auth.authStateReady();
  if (!runtime.auth.currentUser) await runtime.signInAnonymously(runtime.auth);
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await handleStaticApi(input, init);
    return response || originalFetch(input, init);
  };
}
