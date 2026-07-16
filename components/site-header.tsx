"use client";

import { ShoppingCart } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
};

export function SiteHeader({ title, subtitle, trailing }: SiteHeaderProps) {
  const { user, loading, displayName, openAuthModal, signOut } = useAuth();
  const { cartCount, clearCart, openCart } = useCart();

  async function handleSignOut() {
    await signOut();
    clearCart();
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          {subtitle ? (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          ) : null}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href="/shop" />}
          >
            Shop
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openCart()}
          >
            <ShoppingCart className="size-4" />
            Cart
            {cartCount > 0 ? (
              <Badge variant="secondary">{cartCount}</Badge>
            ) : null}
          </Button>

          {!loading && user ? (
            <>
              <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline">
                {displayName}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleSignOut()}
              >
                Log out
              </Button>
            </>
          ) : !loading ? (
            <Button
              type="button"
              size="sm"
              onClick={() => openAuthModal("signin")}
            >
              Sign in
            </Button>
          ) : null}

          {trailing}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
