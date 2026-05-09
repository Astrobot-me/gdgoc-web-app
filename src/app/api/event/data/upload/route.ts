import { NextResponse, type NextRequest } from "next/server";

export async function POST(_request: NextRequest) {
	return NextResponse.json(
		{
			error: "This endpoint is deprecated. Use /api/admin/events/[id]/upload.",
		},
		{ status: 410 },
	);
}
