"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { RevokeButton } from "@/components/admin/revoke-button";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <AdminSectionCard
      eyebrow="Certificates"
      title="Participant records"
      actions={
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, roll, branch"
            className="pl-9"
          />
        </div>
      }
    >
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Holder</TableHead>
              <TableHead>Roll</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-semibold">{row.holderName}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.credentialId ?? row.id}
                  </div>
                </TableCell>
                <TableCell>{row.rollNumber}</TableCell>
                <TableCell>{row.branch}</TableCell>
                <TableCell>{row.issuedAt}</TableCell>
                <TableCell>
                  <StatusBadge tone={row.revokedAt ? "revoked" : "active"}>
                    {row.revokedAt ? "Revoked" : "Active"}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/admin/events/${eventId}/certificates/${
                          row.credentialId ?? row.id
                        }`}
                      >
                        View
                      </Link>
                    </Button>
                    <RevokeButton
                      certId={row.credentialId ?? row.id}
                      revokedAt={row.revokedAt}
                      onChange={(value) => updateRow(row.id, value)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filtered.length ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            No certificates match the search.
          </p>
        ) : null}
      </div>
    </AdminSectionCard>
  );
}
