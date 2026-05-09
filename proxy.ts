import { NextRequest } from "next/server";

export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*'],
}

// Example of default export
export default function proxy(request : NextRequest) {
  // Proxy logic
}