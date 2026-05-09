"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type VerifyLookupFormProps = {
  placeholder?: string;
};

export function VerifyLookupForm({
  placeholder = "Enter certificate ID",
}: VerifyLookupFormProps) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-muted/50 bg-white/80 p-4 shadow-sm"
    >
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Verify a certificate
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="h-11 flex-1 rounded-xl border border-muted/60 bg-white px-3 text-sm text-foreground outline-none transition focus:border-[color:var(--gdg-blue)] focus:ring-2 focus:ring-[color:var(--gdg-blue)]/30"
          aria-label="Certificate ID"
        />
        <Button type="submit" size="lg" className="gap-2">
          Verify
          <Search className="size-4" />
        </Button>
      </div>
    </form>
  );
}
