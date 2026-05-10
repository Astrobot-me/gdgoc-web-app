import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type ExportRouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: ExportRouteParams) {
  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event id." }, { status: 400 });
  }
  const event = await prisma.event.findUnique({
    where: { id: eventId },
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
      certificateId: cert.certificateId,
      credentialId: cert.credentialId,
      holderName: cert.holderName,
      rollNumber: cert.rollNumber,
      branch: cert.branch,
      certificateType: cert.certificateType,
      description: cert.description,
      issuedAt: cert.issuedAt,
      revokedAt: cert.revokedAt,
      createdAt: cert.createdAt,
    })),
  };

  const format = request.nextUrl.searchParams.get("format");

  if (format === "csv") {
    const header = [
      "Certificate ID",
      "Credential ID",
      "Holder Name",
      "Roll Number",
      "Branch",
      "Certificate Type",
      "Description",
      "Issued At",
      "Revoked At",
    ];
    const lines = exportPayload.certificates.map((cert) =>
      [
        cert.certificateId,
        cert.credentialId,
        cert.holderName,
        cert.rollNumber,
        cert.branch,
        cert.certificateType,
        cert.description ?? "",
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
