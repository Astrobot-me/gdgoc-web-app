"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { RevokeButton } from "@/components/admin/revoke-button";

export type CertificateRow = {
  id: string;
  credentialId: string | null;
  holderName: string;
  rollNumber: string;
  branch: string;
  issuedAt: string;
  revokedAt: string | null;
};

type CertificateTableProps = {
  eventId: string;
  rows: CertificateRow[];
};

export function CertificateTable({ eventId, rows }: CertificateTableProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(rows);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return items;
    }
    return items.filter((row) =>
      [row.holderName, row.rollNumber, row.branch, row.credentialId]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term),
        ),
    );
  }, [items, query]);

  const updateRow = (id: string, revokedAt: string | null) => {
    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, revokedAt } : row)),
    );
  };

  return (
    <div className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Certificates
          </p>
          <h3 className="mt-2 font-heading text-xl text-foreground">
            Participant records
          </h3>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-muted/50 bg-white px-3 py-2 text-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, roll, branch"
            className="w-48 bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <th className="py-2">Holder</th>
              <th>Roll</th>
              <th>Branch</th>
              <th>Issued</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted/40">
            {filtered.map((row) => (
              <tr key={row.id} className="text-foreground">
                <td className="py-3">
                  <div className="font-semibold">{row.holderName}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.credentialId ?? row.id}
                  </div>
                </td>
                <td>{row.rollNumber}</td>
                <td>{row.branch}</td>
                <td>{row.issuedAt}</td>
                <td>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      row.revokedAt
                        ? "bg-(--gdg-red)/15 text-(--gdg-red)"
                        : "bg-(--gdg-green)/15 text-(--gdg-green)"
                    }`}
                  >
                    {row.revokedAt ? "Revoked" : "Active"}
                  </span>
                </td>
                <td className="flex justify-end gap-2 py-3">
                  <Link
                    href={`/admin/events/${eventId}/certificates/${
                      row.credentialId ?? row.id
                    }`}
                    className="rounded-full border border-muted/50 px-3 py-1 text-xs font-semibold"
                  >
                    View
                  </Link>
                  <RevokeButton
                    certId={row.credentialId ?? row.id}
                    revokedAt={row.revokedAt}
                    onChange={(value) => updateRow(row.id, value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No certificates match the search.
          </p>
        ) : null}
      </div>
    </div>
  );
}
