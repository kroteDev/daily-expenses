"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IncomingForm } from "@/components/IncomingForm";
import type { Incoming } from "@/domain/entities/Incoming";
import type { IncomingInput } from "@/domain/repositories/IIncomingRepository";
import { getIncomingRepository, getTokenStore } from "@/infrastructure/api/client";
import { getIncoming, updateIncoming } from "@/usecases/incoming";

export default function EditIncomingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [incoming, setIncoming] = useState<Incoming | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getIncoming(getIncomingRepository(), getTokenStore(), id)
      .then(setIncoming)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Falha ao carregar entrada"));
  }, [id]);

  const handleSubmit = async (input: IncomingInput) => {
    await updateIncoming(getIncomingRepository(), getTokenStore(), id, input);
    router.push("/incomings");
  };

  if (loadError) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-red-600">{loadError}</p>
      </main>
    );
  }

  if (!incoming) {
    return (
      <main className="min-h-screen p-8">
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Editar entrada</h1>
        <IncomingForm initial={incoming} submitLabel="Salvar" onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
