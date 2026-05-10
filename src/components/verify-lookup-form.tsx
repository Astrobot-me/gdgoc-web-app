"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type VerifyLookupFormProps = {
  placeholder?: string;
};

export function VerifyLookupForm({
  placeholder = "Enter credential ID or certificate ID",
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
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="h-11 flex-1"
          aria-label="Credential ID or certificate ID"
        />
        <Button type="submit" size="lg" className="gap-2">
          Verify
          <Search className="size-4" />
        </Button>
      </div>
    </form>
  );
}
