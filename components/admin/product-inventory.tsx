"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductIcon } from "@/lib/products/icons";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export type Product = Database["public"]["Tables"]["products"]["Row"];

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

type ProductInventoryProps = {
  products: Product[];
  loading: boolean;
  onDeleted?: (id: string) => void;
};

export function ProductInventory({
  products,
  loading,
  onDeleted,
}: ProductInventoryProps) {
  const [supabase] = useState(() => createClient());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    onDeleted?.(id);
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Inventory</h2>
        <p className="text-sm text-muted-foreground">
          Each row is a separate sellable item.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No products yet. Add your first item above.
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => {
            const Icon = getProductIcon(product.icon);
            return (
              <li key={product.id}>
                <Card>
                  <CardContent className="flex items-start gap-4 py-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{product.name}</p>
                        <Badge variant="secondary">{product.status}</Badge>
                      </div>
                      {product.description ? (
                        <p className="text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      ) : null}
                      <p className="text-sm font-medium">
                        {formatPrice(product.price_cents)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Delete ${product.name}`}
                      disabled={deletingId === product.id}
                      onClick={() => void handleDelete(product.id)}
                    >
                      <Trash2 />
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
