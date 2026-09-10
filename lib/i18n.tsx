"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import generatedTranslations from "@/lib/ui-translations.json";

export const appLocales = ["en", "id", "zh-CN", "zh-TW", "es"] as const;
export type AppLocale = (typeof appLocales)[number];

export const localeOptions: Array<{ value: AppLocale; shortLabel: string; label: string }> = [
  { value: "en", shortLabel: "EN", label: "English" },
  { value: "id", shortLabel: "ID", label: "Bahasa Indonesia" },
  { value: "zh-CN", shortLabel: "简体", label: "简体中文" },
  { value: "zh-TW", shortLabel: "繁體", label: "繁體中文" },
  { value: "es", shortLabel: "ES", label: "Español" },
];

type TranslationCatalog = Record<string, string>;
type TranslationMap = Record<Exclude<AppLocale, "en">, TranslationCatalog>;
type TranslationValues = Record<string, string | number>;

const translations = generatedTranslations as TranslationMap;
const localeStorageKey = "fred-hiring-language";

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && appLocales.includes(value as AppLocale);
}

export function intlLocale(locale: AppLocale) {
  return locale === "id"
    ? "id-ID"
    : locale === "es"
      ? "es-US"
      : locale;
}

export function translate(locale: AppLocale, source: string, values: TranslationValues = {}) {
  const template = locale === "en" ? source : translations[locale]?.[source] || source;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => (
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  ));
}

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (source: string, values?: TranslationValues) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function initialLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(localeStorageKey);
  if (isAppLocale(saved)) return saved;
  const browser = window.navigator.language.toLowerCase();
  if (browser.startsWith("id")) return "id";
  if (browser.startsWith("es")) return "es";
  if (browser.startsWith("zh-tw") || browser.startsWith("zh-hk") || browser.startsWith("zh-mo")) return "zh-TW";
  if (browser.startsWith("zh")) return "zh-CN";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(localeStorageKey, nextLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (source: string, values?: TranslationValues) => translate(locale, source, values),
    [locale],
  );
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider.");
  return context;
}
