"use client";

import { useState, useTransition } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Bulk upload
        </p>
        <h3 className="mt-2 font-heading text-xl text-foreground">
          Import participants
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload .xlsx, .xls, or .csv with Credential ID, Name, Branch, and Roll
          Number columns.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <Button type="submit" size="lg" disabled={isPending} className="gap-2">
          Upload file
          <UploadCloud className="size-4" />
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {result ? (
        <div className="mt-4 rounded-2xl border border-muted/50 bg-muted/20 p-4 text-sm">
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
              {result.errors.length > 5 ? (
                <p>More errors hidden...</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
