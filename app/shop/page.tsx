"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import {
  ShopProductList,
  type ShopProduct,
} from "./components/product-list";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";

export default function ShopPage() {
  const [supabase] = useState(() => createClient());
  const { user, openAuthModal } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("products")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setProducts([]);
    } else {
      setError(null);
      setProducts(data ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function handleAddToCart(product: ShopProduct) {
    setMessage(null);

    if (!user) {
      openAuthModal("signin");
      return;
    }

    const result = addItem({
      productId: product.id,
      name: product.name,
      description: product.description,
      price_cents: product.price_cents,
      icon: product.icon,
    });

    if (!result.ok) {
      setMessage(result.reason);
      return;
    }

    setMessage(`Added “${product.name}” to cart.`);
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader
        title="Shop"
        subtitle={
          <>
            <a href="/" className="hover:underline">
              Home
            </a>
            {" / "}
            Shop
          </>
        }
      />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Available items
          </h2>
          <p className="text-sm text-muted-foreground">
            Each card is one inventory unit. Sign in to add items to your cart.
          </p>
        </div>

        <ShopProductList
          products={products}
          loading={loading}
          error={error}
          message={message}
          onAddToCart={handleAddToCart}
        />
      </main>
    </div>
  );
}
