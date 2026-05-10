import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateEventSchema } from "@/lib/validation";

type EventRouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: EventRouteParams) {
  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event id." }, { status: 400 });
  }
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { certificates: true } } },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  return NextResponse.json({
    event: {
      id: event.id,
      name: event.name,
      description: event.description,
      eventDate: event.eventDate,
      venue: event.venue,
      bannerUrl: event.bannerUrl,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      certificateCount: event._count.certificates,
    },
  });
}

export async function PATCH(request: NextRequest, { params }: EventRouteParams) {
  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event id." }, { status: 400 });
  }
  const body = await request.json();
  const parsed = UpdateEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid event payload.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: parsed.data,
  });

  return NextResponse.json({ event });
}

export async function DELETE(_request: NextRequest, { params }: EventRouteParams) {
  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event id." }, { status: 400 });
  }

  await prisma.event.delete({ where: { id: eventId } });

  return NextResponse.json({ status: "deleted" });
}
