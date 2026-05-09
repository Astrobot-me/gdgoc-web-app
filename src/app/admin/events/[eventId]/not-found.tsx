import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminEventNotFound() {
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <h1 className="font-heading text-2xl text-foreground">
          Event not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The requested event does not exist or was removed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/admin/events">Back to events</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
