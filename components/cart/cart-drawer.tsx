"use client";

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

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function CartDrawer() {
  const { user, loading, openAuthModal } = useAuth();
  const { items, totalCents, isOpen, setCartOpen, removeItem } = useCart();

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setCartOpen}
      swipeDirection="right"
    >
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
        </div>

        <DrawerFooter>
          {user && items.length > 0 ? (
            <div className="flex items-center justify-between pb-2">
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
              <p className="text-base font-semibold">
                {formatPrice(totalCents)}
              </p>
            </div>
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
