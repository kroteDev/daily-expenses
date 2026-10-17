"use client";

import { useRouter } from "next/navigation";
import { IncomingForm } from "@/components/IncomingForm";
import type { IncomingInput } from "@/domain/repositories/IIncomingRepository";
import { getIncomingRepository, getTokenStore } from "@/infrastructure/api/client";
import { createIncoming } from "@/usecases/incoming";

export default function NewIncomingPage() {
  const router = useRouter();

  const handleSubmit = async (input: IncomingInput) => {
    await createIncoming(getIncomingRepository(), getTokenStore(), input);
    router.push("/incomings");
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Nova entrada</h1>
        <IncomingForm submitLabel="Salvar" onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
