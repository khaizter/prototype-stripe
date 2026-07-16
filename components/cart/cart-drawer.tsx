"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { getProductIcon } from "@/lib/products/icons";
import { createClient } from "@/lib/supabase/client";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function CartDrawer() {
  const [supabase] = useState(() => createClient());
  const { user, loading, openAuthModal } = useAuth();
  const {
    items,
    totalCents,
    isOpen,
    setCartOpen,
    removeItem,
    clearCart,
    closeCart,
    notifyCheckoutComplete,
  } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setError(null);

    if (!user) {
      setCartOpen(false);
      openAuthModal("signin");
      return;
    }

    if (items.length === 0) return;

    const productIds = items.map((item) => item.productId);

    setCheckingOut(true);
    const { data, error: updateError } = await supabase
      .from("products")
      .update({ status: "sold" })
      .in("id", productIds)
      .eq("status", "available")
      .select("id");
    setCheckingOut(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    const soldCount = data?.length ?? 0;
    if (soldCount !== productIds.length) {
      // RLS often blocks UPDATE with no error and 0 rows — products stay "available".
      if (soldCount === 0) {
        setError(
          "Checkout could not update products (0 rows). In Supabase SQL editor, run the products UPDATE policy migration, then try again.",
        );
        return;
      }

      setError(
        "Some items were no longer available. Refresh the shop and try again.",
      );
      const soldIds = new Set((data ?? []).map((row) => row.id));
      for (const id of productIds) {
        if (soldIds.has(id)) removeItem(id);
      }
      notifyCheckoutComplete();
      return;
    }

    clearCart();
    notifyCheckoutComplete();
    closeCart();
  }

  return (
    <Drawer open={isOpen} onOpenChange={setCartOpen} swipeDirection="right">
      <DrawerContent className="data-[swipe-direction=right]:[--drawer-content-width:min(100%,24rem)]">
        <DrawerHeader>
          <DrawerTitle>Cart</DrawerTitle>
          <DrawerDescription>
            Items you added stay in this browser session.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !user ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign in to view your cart.
              </p>
              <Button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  openAuthModal("signin");
                }}
              >
                Sign in
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Your cart is empty. Browse the shop and add items.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const Icon = getProductIcon(item.icon);
                return (
                  <li
                    key={item.productId}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium">{item.name}</p>
                      {item.description ? (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                      <p className="text-sm font-medium">
                        {formatPrice(item.price_cents)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DrawerFooter>
          {user && items.length > 0 ? (
            <>
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm text-muted-foreground">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </p>
                <p className="text-base font-semibold">
                  {formatPrice(totalCents)}
                </p>
              </div>
              <Button
                type="button"
                className="w-full"
                disabled={checkingOut}
                onClick={() => void handleCheckout()}
              >
                {checkingOut ? "Checking out…" : "Checkout"}
              </Button>
            </>
          ) : null}
          <DrawerClose
            render={<Button variant="outline" className="w-full" />}
          >
            Close
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
