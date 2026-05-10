import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CertIdParamSchema } from "@/lib/validation";

type VerifyRouteParams = {
    params: Promise<{ certId: string }>;
};

export async function GET(request: NextRequest, { params }: VerifyRouteParams) {
    const { certId } = await params;
    const parsed = CertIdParamSchema.safeParse({ certId });

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid certificate id." },
            { status: 400 },
        );
    }

    const certificate = await prisma.certificate.findFirst({
        where: {
            OR: [{ credentialId: certId }, { certificateId: certId }],
        },
        include: { event: true },
    });

    const userAgent = request.headers.get("user-agent");
    const referer = request.headers.get("referer");

    if (!certificate) {
        await prisma.verificationLog.create({
            data: {
                status: "NOT_FOUND",
                userAgent,
                referer,
            },
        });

        return NextResponse.json(
            { status: "not_found" },
            { status: 404 },
        );
    }

    const status = certificate.revokedAt ? "REVOKED" : "VALID";

    await prisma.verificationLog.create({
        data: {
            status,
            certId: certificate.credentialId,
            eventId: certificate.eventId,
            userAgent,
            referer,
        },
    });

    return NextResponse.json({
        status: status === "VALID" ? "valid" : "revoked",
        certificate: {
            certificateId: certificate.certificateId,
            credentialId: certificate.credentialId,
            holderName: certificate.holderName,
            rollNumber: certificate.rollNumber,
            branch: certificate.branch,
            certificateType: certificate.certificateType,
            description: certificate.description,
            issuedAt: certificate.issuedAt,
            revokedAt: certificate.revokedAt,
        },
        event: {
            id: certificate.event.id,
            name: certificate.event.name,
            description: certificate.event.description,
            eventDate: certificate.event.eventDate,
            venue: certificate.event.venue,
            bannerUrl: certificate.event.bannerUrl,
        },
    });
}
