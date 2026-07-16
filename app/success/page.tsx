import { Suspense } from "react";

import SuccessClient from "./success-client";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-4xl px-6 py-10 text-sm text-muted-foreground">
          Loading…
        </main>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
