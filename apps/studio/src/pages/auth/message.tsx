import { cn } from "common/lib/utils";
import { CheckCircle, CircleAlert } from "common/components/icons";
import { Navigate, useSearchParams } from "react-router-dom";

export default function MessagePage() {
  const [searchParams] = useSearchParams();

  const message = searchParams.get("message");
  const type = searchParams.get("type");
  const isSuccess = type === "success";

  if (!message || !type) return <Navigate to="/" />;

  return (
    <main className="h-full flex items-center justify-center">
      <div
        className={cn(
          "p-3 rounded-md flex items-center gap-x-2 text-sm animate-in zoom-in-90 slide-in-from-bottom-4",
          isSuccess ? "bg-emerald-500/15 text-emerald-500" : "bg-destructive/15 text-destructive"
        )}
      >
        {isSuccess ? <CheckCircle className="h-4 w-4" /> : <CircleAlert />}
        <p>{message}</p>
      </div>
    </main>
  );
}
