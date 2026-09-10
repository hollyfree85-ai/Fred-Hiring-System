"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type"> & {
  leadingIcon?: ReactNode;
};

export function PasswordInput({ className, leadingIcon, ...props }: PasswordInputProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const label = t(visible ? "Hide password" : "Show password");

  return (
    <div className="relative">
      {leadingIcon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400">
          {leadingIcon}
        </span>
      )}
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(leadingIcon && "pl-10", "pr-12", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={label}
        title={label}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
      >
        {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
      </button>
    </div>
  );
}
