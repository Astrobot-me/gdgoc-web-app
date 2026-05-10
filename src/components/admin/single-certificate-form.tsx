"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BadgePlus } from "lucide-react";
import { toast } from "sonner";
import { CreateCertificateSchema } from "@/lib/validation";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
  certificateId: string;
  credentialId: string;
  holderName: string;
  rollNumber: string;
  branch: string;
  issuedAt: string;
  description: string;
  certificateType: "PARTICIPATION" | "WINNER";
};

const initialState: FormState = {
  certificateId: "",
  credentialId: "",
  holderName: "",
  rollNumber: "",
  branch: "",
  issuedAt: "",
  description: "",
  certificateType: "PARTICIPATION",
};

type SingleCertificateFormProps = {
  eventId: number;
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
      certificateId: form.certificateId.trim(),
      credentialId: form.credentialId.trim() || undefined,
      holderName: form.holderName.trim(),
      rollNumber: form.rollNumber.trim(),
      branch: form.branch.trim(),
      certificateType: form.certificateType,
      description: form.description.trim() || undefined,
      issuedAt: form.issuedAt ? new Date(form.issuedAt) : undefined,
    };

    const parsed = CreateCertificateSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid data.");
      toast.error("Please check the certificate details.");
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
        toast.error("Failed to add certificate.");
        return;
      }

      setForm(initialState);
      toast.success("Certificate added.");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <AdminSectionCard
        eyebrow="Add single certificate"
        title="Manually add a certificate"
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="certificate-id">Certificate ID</Label>
            <Input
              id="certificate-id"
              value={form.certificateId}
              onChange={(event) => updateField("certificateId", event.target.value)}
              placeholder="Certificate ID"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="credential-id">Credential ID (optional)</Label>
            <Input
              id="credential-id"
              value={form.credentialId}
              onChange={(event) => updateField("credentialId", event.target.value)}
              placeholder="Auto-generated if left blank"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="holder-name">Holder name</Label>
              <Input
                id="holder-name"
                value={form.holderName}
                onChange={(event) => updateField("holderName", event.target.value)}
                placeholder="Holder name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roll-number">Roll number</Label>
              <Input
                id="roll-number"
                value={form.rollNumber}
                onChange={(event) => updateField("rollNumber", event.target.value)}
                placeholder="Roll number"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={form.branch}
                onChange={(event) => updateField("branch", event.target.value)}
                placeholder="Branch"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issued-at">Issued date</Label>
              <Input
                id="issued-at"
                value={form.issuedAt}
                onChange={(event) => updateField("issuedAt", event.target.value)}
                type="date"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="certificate-type">Certificate type</Label>
              <Select
                id="certificate-type"
                value={form.certificateType}
                onChange={(event) =>
                  updateField(
                    "certificateType",
                    event.target.value as FormState["certificateType"],
                  )
                }
              >
                <option value="PARTICIPATION">Participation</option>
                <option value="WINNER">Winner</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="certificate-description">Description (optional)</Label>
            <Textarea
              id="certificate-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Award, position, or extra notes"
              className="min-h-24"
            />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" size="lg" disabled={isPending} className="gap-2">
            Add certificate
            <BadgePlus className="size-4" />
          </Button>
        </div>
      </AdminSectionCard>
    </form>
  );
}
