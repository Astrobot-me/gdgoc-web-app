import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

export default function AdminEventLoading() {
  return (
    <Card>
      <CardContent className="p-10 text-center animate-spin">
       <div className="h-screen w-screen flex items-center justify-center">
            <Loader width={10} />
       </div>
      </CardContent>
    </Card>
  );
}
