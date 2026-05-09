"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type FormState = {
  name: string;
  eventDate: string;
  venue: string;
  description: string;
  bannerUrl: string;
};

const initialState: FormState = {
  name: "",
  eventDate: "",
  venue: "",
  description: "",
  bannerUrl: "",
};

export function CreateEventForm() {
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

    startTransition(async () => {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          eventDate: form.eventDate,
          venue: form.venue || undefined,
          description: form.description || undefined,
          bannerUrl: form.bannerUrl || undefined,
        }),
      });

      if (!response.ok) {
        setError("Failed to create event. Check the form values.");
        return;
      }

      setForm(initialState);
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Create event
        </p>
        <h2 className="mt-2 font-heading text-2xl text-foreground">
          Add a new GDG event
        </h2>
      </div>
      <input
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
        placeholder="Event name"
        className="h-11 rounded-2xl border border-muted/60 bg-white px-3 text-sm"
        required
      />
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={form.eventDate}
          onChange={(event) => updateField("eventDate", event.target.value)}
          type="date"
          className="h-11 rounded-2xl border border-muted/60 bg-white px-3 text-sm"
          required
        />
        <input
          value={form.venue}
          onChange={(event) => updateField("venue", event.target.value)}
          placeholder="Venue (optional)"
          className="h-11 rounded-2xl border border-muted/60 bg-white px-3 text-sm"
        />
      </div>
      <textarea
        value={form.description}
        onChange={(event) => updateField("description", event.target.value)}
        placeholder="Short description (optional)"
        className="min-h-[96px] rounded-2xl border border-muted/60 bg-white px-3 py-2 text-sm"
      />
      <input
        value={form.bannerUrl}
        onChange={(event) => updateField("bannerUrl", event.target.value)}
        placeholder="Banner URL (optional)"
        className="h-11 rounded-2xl border border-muted/60 bg-white px-3 text-sm"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={isPending} className="gap-2">
        Add event
        <Plus className="size-4" />
      </Button>
    </form>
  );
}
