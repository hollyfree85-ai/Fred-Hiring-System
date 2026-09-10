"use client";

import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { localeOptions, type AppLocale, useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as AppLocale)}>
      <SelectTrigger
        aria-label={t("Choose language")}
        className={`border-white/15 bg-white/10 text-white hover:bg-white/15 focus-visible:ring-cyan-300 ${compact ? "h-10 w-[104px]" : "h-10 w-[172px]"}`}
      >
        <Languages className="size-4 text-cyan-300" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {localeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {compact ? option.shortLabel : option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
