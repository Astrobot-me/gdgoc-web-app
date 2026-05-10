"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
        toast.error("Failed to create event.");
        return;
      }

      setForm(initialState);
      toast.success("Event has been created.");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <AdminSectionCard eyebrow="Create event" title="Add a new GDG event">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="event-name">Event name</Label>
            <Input
              id="event-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Event name"
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="event-date">Event date</Label>
              <Input
                id="event-date"
                value={form.eventDate}
                onChange={(event) => updateField("eventDate", event.target.value)}
                type="date"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-venue">Venue</Label>
              <Input
                id="event-venue"
                value={form.venue}
                onChange={(event) => updateField("venue", event.target.value)}
                placeholder="Venue (optional)"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Short description (optional)"
              className="min-h-24"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-banner">Banner URL</Label>
            <Input
              id="event-banner"
              value={form.bannerUrl}
              onChange={(event) => updateField("bannerUrl", event.target.value)}
              placeholder="Banner URL (optional)"
            />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" size="lg" disabled={isPending} className="gap-2">
            Add event
            <Plus className="size-4" />
          </Button>
        </div>
      </AdminSectionCard>
    </form>
  );
}
