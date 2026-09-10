import type { CandidateRole, QuestionCategory } from "@/lib/question-bank";
import type { ExperienceLevel, JobFamilyId, RestaurantConceptId } from "@/lib/industry-catalog";

export type CandidateIdentity = {
  candidateName: string;
  phone: string;
  role: CandidateRole;
  restaurantConcept: RestaurantConceptId | "";
  jobFamily: JobFamilyId | "";
  experienceLevel: ExperienceLevel | "";
};

export type CandidateBiodata = {
  email: string;
  cityState: string;
  availableStartDate: string;
  restaurantExperience: "" | "none" | "under_1" | "1_2" | "3_5" | "over_5";
  mostRecentEmployer: string;
  mostRecentRole: string;
  reasonLeaving: string;
  englishComfort: "" | "basic" | "conversational" | "professional" | "fluent";
  availableDays: string[];
  availableShifts: string[];
  hoursDesired: "" | "under_20" | "20_30" | "30_40" | "over_40";
  authorizedToWork: boolean | null;
  meetsAgeRequirement: boolean | null;
  alcoholTraining: "" | "not_applicable" | "yes" | "no" | "in_progress";
  whyJoin: string;
  serviceExample: string;
  restaurantConcept: RestaurantConceptId;
  jobFamily: JobFamilyId;
  experienceLevel: ExperienceLevel;
};

export type PublicQuestion = {
  id: string;
  category: QuestionCategory;
  prompt: string;
  options: Array<{ id: string; text: string }>;
  sourceQuestionId?: string;
  contextLead?: import("@/lib/question-bank").QuestionContextLead;
};

export type SubmissionSummary = {
  id: string;
  candidateName: string;
  phone: string;
  role: CandidateRole;
  fitPercentage: number;
  outcome: "pass" | "not_pass";
  criticalMisses: number;
  durationSeconds: number;
  submittedAt: string;
  restaurantConcept?: RestaurantConceptId;
  jobFamily?: JobFamilyId;
  experienceLevel?: ExperienceLevel;
};

export type CategoryScore = {
  category: QuestionCategory;
  label: string;
  score: number;
  max: number;
  percentage: number;
};

export type AnswerReview = {
  questionId: string;
  sourceQuestionId: string;
  category: QuestionCategory;
  categoryLabel: string;
  prompt: string;
  selectedOptionId: string;
  selectedText: string;
  points: number;
  maxPoints: number;
  isCritical: boolean;
  reviewNote: string;
  contextLead?: import("@/lib/question-bank").QuestionContextLead;
};

export type AnalysisPoint = {
  title: string;
  detail: string;
};

export type DevelopmentPlanItem = {
  priority: number;
  area: string;
  currentPercentage: number | null;
  action: string;
  estimatedTimeline: string;
  successMeasure: string;
};

export type SubmissionDetail = SubmissionSummary & {
  roleLabel: string;
  restaurantConceptLabel: string;
  jobFamilyLabel: string;
  experienceLevelLabel: string;
  totalScore: number;
  maxScore: number;
  testVersion: string;
  biodata: CandidateBiodata;
  categoryScores: CategoryScore[];
  answers: AnswerReview[];
  analysis: {
    summary: string;
    hiringRecommendation: {
      status: "recommended" | "conditional" | "not_recommended";
      label: string;
      fitPercentage: number;
      rationale: string;
    };
    swot: {
      strengths: AnalysisPoint[];
      weaknesses: AnalysisPoint[];
      opportunities: AnalysisPoint[];
      threats: AnalysisPoint[];
    };
    developmentPlan: DevelopmentPlanItem[];
    developmentNote: string;
    strengths: Array<{ category: QuestionCategory; label: string; percentage: number; statement: string }>;
    priorities: Array<{ category: QuestionCategory; label: string; percentage: number; statement: string }>;
    reviewItems: AnswerReview[];
    interviewPrompts: string[];
    failedRules: string[];
    methodology: string;
    limitation: string;
  };
};

export type StaffRole = "owner" | "manager";

export type StaffSession = {
  authenticated: boolean;
  role: StaffRole | null;
  displayName: string | null;
  username: string | null;
};

export type ManagerAccount = {
  id: string;
  username: string;
  displayName: string;
  status: "active" | "disabled" | "removed";
  createdAt: string;
  updatedAt: string;
};
