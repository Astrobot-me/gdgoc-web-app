"use client";

import { useState, useTransition } from "react";
import { UploadCloud } from "lucide-react";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadResult = {
  inserted: number;
  updated: number;
  errors: { row: number; message: string }[];
};

type UploadPanelProps = {
  eventId: string;
};

export function UploadPanel({ eventId }: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Select a spreadsheet file to upload.");
      return;
    }

    startTransition(async () => {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch(`/api/admin/events/${eventId}/upload`, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        setError("Upload failed. Please check the file format.");
        return;
      }

      const data = (await response.json()) as UploadResult;
      setResult(data);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <AdminSectionCard
        eyebrow="Bulk upload"
        title="Import participants"
        description="Upload .xlsx, .xls, or .csv with Credential ID, Name, Branch, and Roll Number columns."
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="upload-file">Spreadsheet file</Label>
            <Input
              id="upload-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" size="lg" disabled={isPending} className="gap-2">
            Upload file
            <UploadCloud className="size-4" />
          </Button>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {result ? (
            <Alert>
              <AlertTitle>Upload summary</AlertTitle>
              <AlertDescription>
                <p>
                  Inserted: <strong>{result.inserted}</strong>
                </p>
                <p>
                  Updated: <strong>{result.updated}</strong>
                </p>
                {result.errors.length ? (
                  <div className="mt-3 space-y-1 text-destructive">
                    {result.errors.slice(0, 5).map((item, index) => (
                      <p key={`${item.message}-${index}`}>
                        Row {item.row}: {item.message}
                      </p>
                    ))}
                    {result.errors.length > 5 ? <p>More errors hidden...</p> : null}
                  </div>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </AdminSectionCard>
    </form>
  );
}
