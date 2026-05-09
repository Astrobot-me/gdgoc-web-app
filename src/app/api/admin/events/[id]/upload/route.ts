import { NextResponse, type NextRequest } from "next/server";
import * as xlsx from "xlsx";
import { prisma } from "@/lib/prisma";
import { ExcelRowSchema } from "@/lib/validation";

type UploadRouteParams = {
  params: Promise<{ id: string }>;
};

type UploadError = {
  row: number;
  message: string;
};

const normalizeHeader = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getHeaderIndex = (headers: string[], candidates: string[]) => {
  const normalizedCandidates = candidates.map((candidate) =>
    candidate.toLowerCase(),
  );
  return headers.findIndex((header) => normalizedCandidates.includes(header));
};

export async function POST(request: NextRequest, { params }: UploadRouteParams) {
  const { id: eventId } = await params;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Upload requires a file field named 'file'." },
      { status: 400 },
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File size exceeds 10MB." },
      { status: 400 },
    );
  }

  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    return NextResponse.json(
      { error: "No worksheet found in uploaded file." },
      { status: 400 },
    );
  }

  const rows = xlsx.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as Array<Array<unknown>>;

  const [headerRow, ...dataRows] = rows;
  const headers = (headerRow ?? []).map(normalizeHeader);

  const credentialIndex = getHeaderIndex(headers, [
    "credential id",
    "credential_id",
    "credentialid",
  ]);
  const nameIndex = getHeaderIndex(headers, ["name", "holder name"]);
  const branchIndex = getHeaderIndex(headers, ["branch"]);
  const rollIndex = getHeaderIndex(headers, ["roll number", "roll_number"]);
  const typeIndex = getHeaderIndex(headers, [
    "certificate type",
    "certificate_type",
    "type",
  ]);
  const distinctionIndex = getHeaderIndex(headers, [
    "distinction",
    "achievement",
    "award",
    "position",
    "result",
  ]);

  if ([credentialIndex, nameIndex, branchIndex, rollIndex].some((idx) => idx < 0)) {
    return NextResponse.json(
      { error: "Missing required columns in upload." },
      { status: 400 },
    );
  }

  const errors: UploadError[] = [];
  const parsedRows = dataRows
    .map((row, index) => {
      const credentialId = String(row[credentialIndex] ?? "").trim();
      const holderName = String(row[nameIndex] ?? "").trim();
      const branch = String(row[branchIndex] ?? "").trim();
      const rollNumber = String(row[rollIndex] ?? "").trim();
      const certificateType = row[typeIndex] ?? undefined;
      const distinction =
        distinctionIndex >= 0
          ? String(row[distinctionIndex] ?? "").trim() || undefined
          : undefined;

      if (
        !credentialId &&
        !holderName &&
        !branch &&
        !rollNumber &&
        !certificateType &&
        !distinction
      ) {
        return null;
      }

      const parsed = ExcelRowSchema.safeParse({
        credentialId,
        holderName,
        branch,
        rollNumber,
        certificateType,
        distinction,
      });

      if (!parsed.success) {
        errors.push({
          row: index + 2,
          message: parsed.error.errors[0]?.message ?? "Invalid row data.",
        });
        return null;
      }

      return parsed.data;
    })
    .filter((row): row is ReturnType<typeof ExcelRowSchema.parse> => row !== null);

  const seenCredentials = new Set<string>();
  for (const row of parsedRows) {
    if (seenCredentials.has(row.credentialId)) {
      errors.push({
        row: -1,
        message: `Duplicate credential ID in upload: ${row.credentialId}`,
      });
    }
    seenCredentials.add(row.credentialId);
  }

  if (errors.length) {
    return NextResponse.json({
      inserted: 0,
      updated: 0,
      errors,
    });
  }

  const existing = await prisma.certificate.findMany({
    where: { credentialId: { in: parsedRows.map((row) => row.credentialId) } },
  });
  const existingByCredential = new Map(
    existing.map((cert) => [cert.credentialId, cert]),
  );

  let inserted = 0;
  let updated = 0;

  for (const row of parsedRows) {
    const existingCert = existingByCredential.get(row.credentialId);

    if (existingCert && existingCert.eventId !== eventId) {
      errors.push({
        row: -1,
        message: `Credential ID already used in another event: ${row.credentialId}`,
      });
      continue;
    }

    if (existingCert) {
      await prisma.certificate.update({
        where: { id: existingCert.id },
        data: {
          holderName: row.holderName,
          rollNumber: row.rollNumber,
          branch: row.branch,
          certificateType: row.certificateType,
          distinction: row.distinction,
        },
      });
      updated += 1;
      continue;
    }

    await prisma.certificate.create({
      data: {
        credentialId: row.credentialId,
        eventId,
        holderName: row.holderName,
        rollNumber: row.rollNumber,
        branch: row.branch,
        certificateType: row.certificateType,
        distinction: row.distinction,
      },
    });
    inserted += 1;
  }

  return NextResponse.json({ inserted, updated, errors });
}
