import { createCanvas, loadImage } from "@napi-rs/canvas";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { CertIdParamSchema } from "@/lib/validation";
import type { NextRequest } from "next/server";

type CertificateImageParams = {
  params: Promise<{ certId: string }>;
};

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 850;
const BORDER_HEIGHT = 8;

const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) => {
  const words = text.split(" ");
  let line = "";
  let offsetY = y;

  for (const word of words) {
    const testLine = line.length ? `${line} ${word}` : word;
    const { width } = ctx.measureText(testLine);

    if (width > maxWidth && line.length) {
      ctx.fillText(line, x, offsetY);
      line = word;
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line.length) {
    ctx.fillText(line, x, offsetY);
  }
};

export async function GET(request: NextRequest, { params }: CertificateImageParams) {
  const { certId } = await params;
  const parsed = CertIdParamSchema.safeParse({ certId });

  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  const certificate = await prisma.certificate.findFirst({
    where: {
      OR: [{ id: certId }, { credentialId: certId }],
    },
    include: { event: true },
  });

  if (!certificate || certificate.revokedAt) {
    return new Response(null, { status: 404 });
  }

  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const stripeColors = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];
  const stripeWidth = CANVAS_WIDTH / stripeColors.length;

  stripeColors.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(index * stripeWidth, 0, stripeWidth, BORDER_HEIGHT);
    ctx.fillRect(
      index * stripeWidth,
      CANVAS_HEIGHT - BORDER_HEIGHT,
      stripeWidth,
      BORDER_HEIGHT,
    );
  });

  ctx.fillStyle = "#111827";
  ctx.textAlign = "center";

  ctx.font = "bold 46px sans-serif";
  ctx.fillText("Certificate of Participation", CANVAS_WIDTH / 2, 140);

  ctx.font = "24px sans-serif";
  ctx.fillText(
    `Awarded to ${certificate.holderName}`,
    CANVAS_WIDTH / 2,
    200,
  );

  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#374151";
  const bodyText = `This is to certify that ${certificate.holderName} of ${certificate.branch}, Roll No. ${certificate.rollNumber} participated in ${certificate.event.name} held on ${certificate.event.eventDate.toDateString()}.`;
  drawWrappedText(
    ctx,
    bodyText,
    CANVAS_WIDTH / 2,
    280,
    CANVAS_WIDTH - 200,
    32,
  );

  ctx.globalAlpha = 0.08;
  ctx.font = "bold 110px sans-serif";
  ctx.fillStyle = "#111827";
  ctx.fillText("GDG on Campus", CANVAS_WIDTH / 2, 520);
  ctx.globalAlpha = 1;

  const origin = new URL(request.url).origin;
  const verifyId = certificate.credentialId ?? certificate.id;
  const verifyUrl = `${origin}/verify/${verifyId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 120,
  });
  const qrImage = await loadImage(qrDataUrl);
  ctx.drawImage(qrImage, CANVAS_WIDTH - 170, CANVAS_HEIGHT - 190, 120, 120);

  ctx.font = "16px monospace";
  ctx.fillStyle = "#111827";
  ctx.textAlign = "left";
  ctx.fillText(`Certificate ID: ${verifyId}`, 60, CANVAS_HEIGHT - 80);

  const buffer = canvas.toBuffer("image/png");

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
