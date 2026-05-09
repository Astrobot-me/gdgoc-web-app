"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BadgePlus } from "lucide-react";
import { CreateCertificateSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";

type FormState = {
  credentialId: string;
  holderName: string;
  rollNumber: string;
  branch: string;
  issuedAt: string;
};

const initialState: FormState = {
  credentialId: "",
  holderName: "",
  rollNumber: "",
  branch: "",
  issuedAt: "",
};

type SingleCertificateFormProps = {
  eventId: string;
};

export function SingleCertificateForm({ eventId }: SingleCertificateFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payload = {
      credentialId: form.credentialId.trim() || undefined,
      holderName: form.holderName.trim(),
      rollNumber: form.rollNumber.trim(),
      branch: form.branch.trim(),
      issuedAt: form.issuedAt ? new Date(form.issuedAt) : undefined,
    };

    const parsed = CreateCertificateSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid data.");
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/admin/events/${eventId}/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          issuedAt: parsed.data.issuedAt
            ? parsed.data.issuedAt.toISOString()
            : undefined,
        }),
      });

      if (!response.ok) {
        setError("Failed to add certificate. Check for duplicates.");
        return;
      }

      setForm(initialState);
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Add single certificate
        </p>
        <h3 className="mt-2 font-heading text-xl text-foreground">
          Manually add a participant
        </h3>
      </div>
      <div className="mt-4 grid gap-3">
        <input
          value={form.credentialId}
          onChange={(event) => updateField("credentialId", event.target.value)}
          placeholder="Credential ID (optional)"
          className="h-11 rounded-2xl border border-muted/60 bg-white px-3 text-sm"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.holderName}
            onChange={(event) => updateField("holderName", event.target.value)}
            placeholder="Holder name"
            className="h-11 rounded-2xl border border-muted/60 bg-white px-3 text-sm"
            required
          />
          <input
            value={form.rollNumber}
            onChange={(event) => updateField("rollNumber", event.target.value)}
            placeholder="Roll number"
            className="h-11 rounded-2xl border border-muted/60 bg-white px-3 text-sm"
            required
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.branch}
            onChange={(event) => updateField("branch", event.target.value)}
            placeholder="Branch"
            className="h-11 rounded-2xl border border-muted/60 bg-white px-3 text-sm"
            required
          />
          <input
            value={form.issuedAt}
            onChange={(event) => updateField("issuedAt", event.target.value)}
            type="date"
            className="h-11 rounded-2xl border border-muted/60 bg-white px-3 text-sm"
          />
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={isPending} className="mt-4 gap-2">
        Add certificate
        <BadgePlus className="size-4" />
      </Button>
    </form>
  );
}
