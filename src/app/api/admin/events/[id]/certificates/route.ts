import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateCertificateSchema } from "@/lib/validation";

type CertificatesRouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: NextRequest,
  { params }: CertificatesRouteParams,
) {
  const { id: eventId } = await params;
  const body = await request.json();
  const parsed = CreateCertificateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid certificate payload.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const certificate = await prisma.certificate.create({
      data: {
        eventId,
        credentialId: parsed.data.credentialId,
        holderName: parsed.data.holderName,
        rollNumber: parsed.data.rollNumber,
        branch: parsed.data.branch,
        issuedAt: parsed.data.issuedAt,
      },
    });

    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create certificate." },
      { status: 409 },
    );
  }
}
