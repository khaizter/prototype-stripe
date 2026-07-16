"use client";

import { useCallback, useEffect, useState } from "react";

import { ProductForm } from "@/components/admin/product-form";
import {
  ProductInventory,
  type Product,
} from "@/components/admin/product-inventory";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const [supabase] = useState(() => createClient());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
      setProducts([]);
    } else {
      setLoadError(null);
      setProducts(data ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">
              <a href="/" className="hover:underline">
                Home
              </a>
              {" / "}
              Admin
            </p>
            <h1 className="text-lg font-semibold">Products</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Badge variant="secondary">
              {products.length} {products.length === 1 ? "item" : "items"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
        {loadError ? (
          <p className="text-sm text-destructive">{loadError}</p>
        ) : null}
        <ProductForm onCreated={loadProducts} />
        <ProductInventory
          products={products}
          loading={loading}
          onDeleted={(id) =>
            setProducts((current) =>
              current.filter((product) => product.id !== id),
            )
          }
        />
      </main>
    </div>
  );
}
