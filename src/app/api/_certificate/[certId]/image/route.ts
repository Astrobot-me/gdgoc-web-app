import QRCode from "qrcode";
import { createRequire } from "node:module";
import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { CertIdParamSchema } from "@/lib/validation";
import type { NextRequest } from "next/server";

type CertificateImageParams = {
  params: Promise<{ certId: string }>;
};

type CanvasModule = typeof import("@napi-rs/canvas");

type CertificateWithEvent = Prisma.CertificateGetPayload<{
  include: { event: true };
}>;

export const runtime = "nodejs";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 850;
const BORDER_HEIGHT = 8;
const CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";
const require = createRequire(import.meta.url);

type TextDrawingContext = {
  measureText: (text: string) => { width: number };
  fillText: (text: string, x: number, y: number) => void;
};

const drawWrappedText = (
  ctx: TextDrawingContext,
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

const wrapText = (text: string, maxCharactersPerLine: number) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const testLine = line.length ? `${line} ${word}` : word;

    if (testLine.length > maxCharactersPerLine && line.length) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line.length) {
    lines.push(line);
  }

  return lines;
};

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const loadCanvasModule = async (): Promise<CanvasModule | null> => {
  try {
    return require("@napi-rs/canvas") as CanvasModule;
  } catch (error) {
    console.warn("Canvas native binding unavailable, using SVG fallback.", error);
    return null;
  }
};

const getCertificate = async (certId: string) =>
  prisma.certificate.findFirst({
    where: {
      OR: [{ id: certId }, { credentialId: certId }],
    },
    include: { event: true },
  });

const buildCertificateBodyText = (certificate: NonNullable<CertificateWithEvent>) =>
  `This is to certify that ${certificate.holderName} of ${certificate.branch}, Roll No. ${certificate.rollNumber} participated in ${certificate.event.name} held on ${certificate.event.eventDate.toDateString()}.`;

const renderSvgCertificate = async ({
  certificate,
  verifyId,
  verifyUrl,
}: {
  certificate: NonNullable<CertificateWithEvent>;
  verifyId: string;
  verifyUrl: string;
}) => {
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 120,
  });
  const bodyLines = wrapText(buildCertificateBodyText(certificate), 72);
  const bodyMarkup = bodyLines
    .map((line, index) => {
      const y = 280 + index * 32;
      return `<text x="600" y="${y}" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" fill="#374151">${escapeXml(line)}</text>`;
    })
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}">
      <rect width="100%" height="100%" fill="#ffffff" />
      <rect x="0" y="0" width="300" height="${BORDER_HEIGHT}" fill="#4285F4" />
      <rect x="300" y="0" width="300" height="${BORDER_HEIGHT}" fill="#EA4335" />
      <rect x="600" y="0" width="300" height="${BORDER_HEIGHT}" fill="#FBBC04" />
      <rect x="900" y="0" width="300" height="${BORDER_HEIGHT}" fill="#34A853" />
      <rect x="0" y="${CANVAS_HEIGHT - BORDER_HEIGHT}" width="300" height="${BORDER_HEIGHT}" fill="#4285F4" />
      <rect x="300" y="${CANVAS_HEIGHT - BORDER_HEIGHT}" width="300" height="${BORDER_HEIGHT}" fill="#EA4335" />
      <rect x="600" y="${CANVAS_HEIGHT - BORDER_HEIGHT}" width="300" height="${BORDER_HEIGHT}" fill="#FBBC04" />
      <rect x="900" y="${CANVAS_HEIGHT - BORDER_HEIGHT}" width="300" height="${BORDER_HEIGHT}" fill="#34A853" />
      <text x="600" y="140" text-anchor="middle" font-size="46" font-weight="700" font-family="Arial, sans-serif" fill="#111827">Certificate of Participation</text>
      <text x="600" y="200" text-anchor="middle" font-size="24" font-family="Arial, sans-serif" fill="#111827">Awarded to ${escapeXml(certificate.holderName)}</text>
      ${bodyMarkup}
      <text x="600" y="520" text-anchor="middle" font-size="110" font-weight="700" font-family="Arial, sans-serif" fill="#111827" fill-opacity="0.08">GDG on Campus</text>
      <image href="${qrDataUrl}" x="1030" y="660" width="120" height="120" />
      <text x="60" y="770" font-size="16" font-family="Courier New, monospace" fill="#111827">Certificate ID: ${escapeXml(verifyId)}</text>
    </svg>
  `.trim();

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
    },
  });
};

const renderPngCertificate = async ({
  canvasModule,
  certificate,
  verifyId,
  verifyUrl,
}: {
  canvasModule: CanvasModule;
  certificate: NonNullable<CertificateWithEvent>;
  verifyId: string;
  verifyUrl: string;
}) => {
  const { createCanvas, loadImage } = canvasModule;
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
  drawWrappedText(
    ctx,
    buildCertificateBodyText(certificate),
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
  const body = new Uint8Array(buffer);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": CACHE_CONTROL,
    },
  });
};

export async function GET(request: NextRequest, { params }: CertificateImageParams) {
  const { certId } = await params;
  const parsed = CertIdParamSchema.safeParse({ certId });

  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  const certificate = await getCertificate(certId);

  if (!certificate || certificate.revokedAt) {
    return new Response(null, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const verifyId = certificate.credentialId ?? certificate.id;
  const verifyUrl = `${origin}/verify/${verifyId}`;

  const canvasModule = await loadCanvasModule();
  if (!canvasModule) {
    return renderSvgCertificate({ certificate, verifyId, verifyUrl });
  }

  return renderPngCertificate({
    canvasModule,
    certificate,
    verifyId,
    verifyUrl,
  });
}
