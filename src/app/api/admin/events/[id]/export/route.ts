import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type ExportRouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: ExportRouteParams) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { certificates: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const exportPayload = {
    event: {
      id: event.id,
      name: event.name,
      description: event.description,
      eventDate: event.eventDate,
      venue: event.venue,
      bannerUrl: event.bannerUrl,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    },
    certificates: event.certificates.map((cert) => ({
      id: cert.id,
      credentialId: cert.credentialId,
      holderName: cert.holderName,
      rollNumber: cert.rollNumber,
      branch: cert.branch,
      issuedAt: cert.issuedAt,
      revokedAt: cert.revokedAt,
      createdAt: cert.createdAt,
    })),
  };

  const format = request.nextUrl.searchParams.get("format");

  if (format === "csv") {
    const header = [
      "Credential ID",
      "Holder Name",
      "Roll Number",
      "Branch",
      "Issued At",
      "Revoked At",
    ];
    const lines = exportPayload.certificates.map((cert) =>
      [
        cert.credentialId ?? cert.id,
        cert.holderName,
        cert.rollNumber,
        cert.branch,
        cert.issuedAt?.toISOString?.() ?? String(cert.issuedAt),
        cert.revokedAt?.toISOString?.() ?? "",
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );

    const csv = [header.join(","), ...lines].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${event.name}-certificates.csv"`,
      },
    });
  }

  return NextResponse.json(exportPayload);
}
