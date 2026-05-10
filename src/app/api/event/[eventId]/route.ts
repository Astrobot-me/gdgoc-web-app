import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type EventRouteParams = {
	params: Promise<{ eventId: string }>;
};

export async function GET(_request: NextRequest, { params }: EventRouteParams) {
	const { eventId } = await params;
	const eventIdValue = Number(eventId);
	if (Number.isNaN(eventIdValue)) {
		return NextResponse.json({ error: "Invalid event id." }, { status: 400 });
	}
	const event = await prisma.event.findUnique({
		where: { id: eventIdValue },
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
			certificateCount: event._count.certificates,
		},
	});
}
