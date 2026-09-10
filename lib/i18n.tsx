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
const supplementalTranslations: TranslationMap = {
  id: {
    "Restaurant type": "Jenis restoran",
    "Job family": "Kelompok posisi",
    "Experience level": "Tingkat pengalaman",
    "Assessment path:": "Jalur asesmen:",
    "Choose a restaurant type, job family, position, and experience level.": "Pilih jenis restoran, kelompok posisi, posisi, dan tingkat pengalaman.",
    "Choose a position from the selected job family.": "Pilih posisi yang tersedia di kelompok posisi tersebut.",
    "Service model & price point": "Model pelayanan & tingkat harga",
    "American restaurant concepts": "Konsep restoran Amerika",
    "Steak, barbecue & meat": "Steak, BBQ & daging",
    "Seafood concepts": "Konsep restoran seafood",
    "Japanese concepts": "Konsep restoran Jepang",
    "Chinese & Taiwanese concepts": "Konsep restoran Tiongkok & Taiwan",
    "Korean concepts": "Konsep restoran Korea",
    "Southeast Asian concepts": "Konsep restoran Asia Tenggara",
    "Management": "Manajemen",
    "Kitchen Management": "Manajemen Dapur",
    "Server & Guest Service": "Server & Pelayanan Tamu",
    "Host, Cashier & Front Desk": "Host, Kasir & Front Desk",
    "Bar & Beverage": "Bar & Minuman",
    "Food Runner, Busser & Expo": "Food Runner, Busser & Expo",
    "General Kitchen / Cook": "Dapur Umum / Koki",
    "Japanese & Sushi": "Dapur Jepang & Sushi",
    "Hibachi / Teppanyaki": "Hibachi / Teppanyaki",
    "Specialty Kitchen": "Dapur Spesialis",
    "Takeout, Delivery & Catering": "Takeout, Delivery & Catering",
    "Utility, Cleaning & Support": "Kebersihan & Pendukung Operasional",
    "Not recorded": "Belum tercatat",
    "Restaurant type: {restaurant}": "Jenis restoran: {restaurant}",
    "Random work judgment": "Penilaian kerja acak",
    "Tailored technical": "Teknis sesuai posisi",
  },
  es: {
    "Restaurant type": "Tipo de restaurante",
    "Job family": "Área de trabajo",
    "Experience level": "Nivel de experiencia",
    "Assessment path:": "Ruta de la evaluación:",
    "Choose a restaurant type, job family, position, and experience level.": "Elige el tipo de restaurante, el área de trabajo, el puesto y el nivel de experiencia.",
    "Choose a position from the selected job family.": "Elige un puesto dentro del área de trabajo seleccionada.",
    "Service model & price point": "Modelo de servicio y nivel de precios",
    "American restaurant concepts": "Conceptos de restaurantes estadounidenses",
    "Steak, barbecue & meat": "Steakhouse, BBQ y carnes",
    "Seafood concepts": "Conceptos de restaurantes de mariscos",
    "Japanese concepts": "Conceptos de restaurantes japoneses",
    "Chinese & Taiwanese concepts": "Conceptos chinos y taiwaneses",
    "Korean concepts": "Conceptos de restaurantes coreanos",
    "Southeast Asian concepts": "Conceptos del Sudeste Asiático",
    "Management": "Gerencia",
    "Kitchen Management": "Gerencia de Cocina",
    "Server & Guest Service": "Meseros y Atención al Cliente",
    "Host, Cashier & Front Desk": "Recepción, Caja y Reservas",
    "Bar & Beverage": "Bar y Bebidas",
    "Food Runner, Busser & Expo": "Food Runner, Busser y Expo",
    "General Kitchen / Cook": "Cocina General",
    "Japanese & Sushi": "Cocina Japonesa y Sushi",
    "Hibachi / Teppanyaki": "Hibachi / Teppanyaki",
    "Specialty Kitchen": "Cocina Especializada",
    "Takeout, Delivery & Catering": "Pedidos para Llevar, Entrega y Catering",
    "Utility, Cleaning & Support": "Limpieza y Apoyo Operativo",
    "Not recorded": "No registrado",
    "Restaurant type: {restaurant}": "Tipo de restaurante: {restaurant}",
    "Random work judgment": "Criterio laboral aleatorio",
    "Tailored technical": "Técnicas según el puesto",
  },
  "zh-CN": {
    "Restaurant type": "餐厅类型", "Job family": "岗位类别", "Experience level": "经验水平", "Assessment path:": "测评路径：",
    "Choose a restaurant type, job family, position, and experience level.": "请选择餐厅类型、岗位类别、应聘职位和经验水平。",
    "Choose a position from the selected job family.": "请选择该岗位类别下的职位。",
    "Service model & price point": "服务模式与价格定位", "American restaurant concepts": "美式餐厅类型", "Steak, barbecue & meat": "牛排、烧烤与肉类餐厅",
    "Seafood concepts": "海鲜餐厅类型", "Japanese concepts": "日式餐厅类型", "Chinese & Taiwanese concepts": "中式与台式餐厅类型",
    "Korean concepts": "韩式餐厅类型", "Southeast Asian concepts": "东南亚餐厅类型", "Management": "餐厅管理",
    "Kitchen Management": "厨房管理", "Server & Guest Service": "餐厅服务与顾客接待", "Host, Cashier & Front Desk": "迎宾、收银与前台",
    "Bar & Beverage": "酒吧与饮品", "Food Runner, Busser & Expo": "传菜、清台与出餐协调", "General Kitchen / Cook": "综合厨房与厨师",
    "Japanese & Sushi": "日料与寿司", "Hibachi / Teppanyaki": "日式铁板烧", "Specialty Kitchen": "特色厨房",
    "Takeout, Delivery & Catering": "外带、外送与餐饮承办", "Utility, Cleaning & Support": "清洁与运营支持", "Not recorded": "未记录",
    "Restaurant type: {restaurant}": "餐厅类型：{restaurant}",
    "Random work judgment": "随机工作判断题", "Tailored technical": "岗位定制技术题",
  },
  "zh-TW": {
    "Restaurant type": "餐廳類型", "Job family": "職位類別", "Experience level": "經驗程度", "Assessment path:": "測評路徑：",
    "Choose a restaurant type, job family, position, and experience level.": "請選擇餐廳類型、職位類別、應徵職位和經驗程度。",
    "Choose a position from the selected job family.": "請選擇該職位類別下的職位。",
    "Service model & price point": "服務模式與價格定位", "American restaurant concepts": "美式餐廳類型", "Steak, barbecue & meat": "牛排、燒烤與肉類餐廳",
    "Seafood concepts": "海鮮餐廳類型", "Japanese concepts": "日式餐廳類型", "Chinese & Taiwanese concepts": "中式與台式餐廳類型",
    "Korean concepts": "韓式餐廳類型", "Southeast Asian concepts": "東南亞餐廳類型", "Management": "餐廳管理",
    "Kitchen Management": "廚房管理", "Server & Guest Service": "餐廳服務與顧客接待", "Host, Cashier & Front Desk": "迎賓、收銀與前台",
    "Bar & Beverage": "酒吧與飲品", "Food Runner, Busser & Expo": "傳菜、清台與出餐協調", "General Kitchen / Cook": "綜合廚房與廚師",
    "Japanese & Sushi": "日料與壽司", "Hibachi / Teppanyaki": "日式鐵板燒", "Specialty Kitchen": "特色廚房",
    "Takeout, Delivery & Catering": "外帶、外送與餐飲承辦", "Utility, Cleaning & Support": "清潔與營運支援", "Not recorded": "未記錄",
    "Restaurant type: {restaurant}": "餐廳類型：{restaurant}",
    "Random work judgment": "隨機工作判斷題", "Tailored technical": "職位客製技術題",
  },
};
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
  const template = locale === "en" ? source : translations[locale]?.[source] || supplementalTranslations[locale]?.[source] || source;
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
