import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateEventSchema } from "@/lib/validation";

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { eventDate: "desc" },
    include: { _count: { select: { certificates: true } } },
  });

  return NextResponse.json({
    events: events.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      eventDate: event.eventDate,
      venue: event.venue,
      bannerUrl: event.bannerUrl,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      certificateCount: event._count.certificates,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid event payload.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const event = await prisma.event.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      eventDate: parsed.data.eventDate,
      venue: parsed.data.venue,
      bannerUrl: parsed.data.bannerUrl,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
