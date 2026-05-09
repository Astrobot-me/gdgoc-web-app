import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CertIdParamSchema } from "@/lib/validation";

type RevokeRouteParams = {
  params: Promise<{ certId: string }>;
};

export async function POST(
  _request: NextRequest,
  { params }: RevokeRouteParams,
) {
  const { certId } = await params;
  const parsed = CertIdParamSchema.safeParse({ certId });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid certificate id." },
      { status: 400 },
    );
  }

  const certificate = await prisma.certificate.findFirst({
    where: { OR: [{ id: certId }, { credentialId: certId }] },
  });

  if (!certificate) {
    return NextResponse.json(
      { error: "Certificate not found." },
      { status: 404 },
    );
  }

  const revokedAt = certificate.revokedAt ? null : new Date();
  const updated = await prisma.certificate.update({
    where: { id: certificate.id },
    data: { revokedAt },
  });

  return NextResponse.json({
    certificate: {
      id: updated.id,
      credentialId: updated.credentialId,
      revokedAt: updated.revokedAt,
    },
  });
}
