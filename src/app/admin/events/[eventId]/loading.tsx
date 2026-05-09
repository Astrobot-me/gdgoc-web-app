import { Card, CardContent } from "@/components/ui/card";

export default function AdminEventLoading() {
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <p className="text-sm text-muted-foreground">Loading event details...</p>
      </CardContent>
    </Card>
  );
}
