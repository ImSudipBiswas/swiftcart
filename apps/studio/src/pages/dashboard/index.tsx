import { useNavigate } from "react-router-dom";
import { Button } from "ui/components/button";

import { api } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const navigate = useNavigate();

  const signOut = async () => {
    await api.post("/auth/v1/sign-out");
    navigate(0);
  };

  return (
    <main className="h-full flex flex-col gap-4 items-center justify-center">
      <h1 className="text-3xl md:text-4xl font-bold underline">DashboardOverviewPage</h1>
      <Button onClick={signOut}>Sign out</Button>
    </main>
  );
}
