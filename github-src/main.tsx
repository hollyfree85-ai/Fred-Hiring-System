import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AssessmentApp } from "@/app/assessment-app";
import "@/app/globals.css";
import { installFirebaseApiShim } from "@/github-src/firebase-api-shim";

async function start() {
  try {
    await installFirebaseApiShim();
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <AssessmentApp />
      </StrictMode>,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "The assessment could not start.";
    createRoot(document.getElementById("root")!).render(
      <main className="grid min-h-screen place-items-center bg-[#f3f8fa] p-5 text-[#10212d]">
        <section className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-7 shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[.14em] text-red-700">Setup required</p>
          <h1 className="mt-2 text-2xl font-black">Candidate assessment is temporarily unavailable</h1>
          <p className="mt-3 leading-7 text-slate-600">{message}</p>
        </section>
      </main>,
    );
  }
}

void start();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL("sw.js", document.baseURI);
    const scopeUrl = new URL(".", document.baseURI);
    void navigator.serviceWorker.register(serviceWorkerUrl, {
      scope: scopeUrl.pathname,
    });
  });
}
