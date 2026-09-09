# Fred Hiring System

A mobile-friendly hiring assessment for The Juicy Seafood & Bar. The public candidate flow requires no account, while the protected Owner and Manager workspace shows role-fit scoring, detailed answer analysis, SWOT hiring risk, interview prompts, prioritized coaching timelines, and downloadable PDF reports.

## Assessment design

- 75 questions per position
- 30 job-behavior questions: work style, communication, and customer problem solving
- 45 position-specific technical questions
- 10 positions: Host / Cashier, Server, Bartender, Busser / Food Runner, Assistant Manager, Cook, Sushi Cook, Prep Cook, Sushi Preparation, and Sushi Chef
- Questions cover multiple restaurant formats, not only seafood service
- Weighted result: technical 60%, work style 15%, communication 12.5%, problem solving 12.5%
- Written passing standard: 75% overall, every section minimum, and no zero-point response on a designated critical item
- Manager reports include strengths, weaknesses, opportunities, threats, a recommendation band, and an estimated 1–90 day development plan derived from scored job-related gaps

This is a job-related situational assessment, not a clinical psychological diagnosis. The written result is designed to support a consistent manager review and structured interview, not replace human judgment.
Development timelines are planning estimates, not guarantees, and must be adjusted from observed job performance without using protected characteristics.

## Architecture

- React + Vite static website hosted on GitHub Pages
- Firebase Authentication:
  - anonymous sign-in for candidates, with no candidate sign-up screen
  - Email/Password authentication behind the Staff / Owner interface
- Cloud Firestore for assessment submissions and live manager updates
- Firestore Security Rules allow candidates to create submissions, active Managers to review them, and the Owner to manage the Manager allowlist
- Fred is the sole bootstrap Owner; passwords are stored only by Firebase Authentication and never committed to GitHub
- The Owner can create, rename, disable, and remove Manager access; removed accounts cannot read Firestore data
- Scores are recalculated from the bundled answer key when a manager opens results; a score supplied by the candidate browser is never trusted

## Local commands

```bash
npm ci
npm run typecheck:github
npm run dev:github
npm run build:github
```

The production build is written to `github-dist/`.

## Firebase setup

1. Create a dedicated Firebase project for this assessment.
2. Register a Web app and place its public Firebase web configuration in `github-src/firebase-config.ts`.
3. Enable Anonymous and Email/Password providers in Firebase Authentication.
4. Create the Owner authentication user using the private email identifier defined in `github-src/firebase-config.ts`. Set the Owner password only in Firebase Authentication; never add it to source files.
5. Add the GitHub Pages hostname to Firebase Authentication's authorized domains.
6. Create Cloud Firestore in production mode and deploy `firestore.rules`.
7. Sign in as Fred and create Manager accounts from the Owner controls. No Manager account is pre-created.

The Firebase web API key is an application identifier, not an authorization secret. Database access is enforced by Firebase Authentication and `firestore.rules`.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` type-checks, builds, and deploys the site whenever `main` is updated. In the repository settings, set Pages source to **GitHub Actions**.

Use the repository name `Fred-Hiring-System` so the configured GitHub Pages base path matches the published URL.

## Hiring-use guardrails

- Ask every candidate for the same position the same scored questions.
- Provide a reasonable accommodation or accessible format when needed.
- Do not use protected characteristics or medical information in scoring.
- Review critical misses and structured interview evidence before making a final decision.
- Revalidate the question bank when duties, menus, recipes, laws, licenses, or operating procedures change.
- Confirm the current Alabama ABC license/RVP requirements before assigning alcohol duties.

This project is an operational tool, not legal advice or a substitute for review by qualified employment counsel.
