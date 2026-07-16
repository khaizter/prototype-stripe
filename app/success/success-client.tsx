"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart, notifyCheckoutComplete } = useCart();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (cleared) return;
    clearCart();
    notifyCheckoutComplete();
    setCleared(true);
  }, [cleared, clearCart, notifyCheckoutComplete]);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader
        title="Success"
        subtitle={
          <>
            <a href="/" className="hover:underline">
              Home
            </a>
            {" / "}
            Success
          </>
        }
      />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          Payment received
        </h2>
        <p className="text-muted-foreground">
          Thanks — Stripe Checkout completed successfully.
          {sessionId ? (
            <>
              {" "}
              Session:{" "}
              <span className="font-mono text-sm break-all">{sessionId}</span>
            </>
          ) : null}
        </p>
        <p className="text-sm text-muted-foreground">
          Inventory is marked sold when the{" "}
          <code className="font-mono text-xs">checkout.session.completed</code>{" "}
          webhook runs (keep{" "}
          <code className="font-mono text-xs">stripe listen</code> running
          locally).
        </p>
        <Button nativeButton={false} render={<a href="/shop" />}>
          Back to shop
        </Button>
      </main>
    </div>
  );
}
