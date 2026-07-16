"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProductIcon } from "@/lib/products/icons";
import type { Database } from "@/types/database";

export type ShopProduct = Database["public"]["Tables"]["products"]["Row"];

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

type ShopProductListProps = {
  products: ShopProduct[];
  loading: boolean;
  error?: string | null;
  message?: string | null;
  onAddToCart: (product: ShopProduct) => void;
};

export function ShopProductList({
  products,
  loading,
  error,
  message,
  onAddToCart,
}: ShopProductListProps) {
  return (
    <div className="space-y-4">
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No available products. Add some in{" "}
          <a href="/admin" className="underline">
            Admin
          </a>
          .
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => {
            const Icon = getProductIcon(product.icon);
            return (
              <li key={product.id}>
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="text-base">
                          {product.name}
                        </CardTitle>
                        <CardDescription>
                          {product.description || "No description"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {formatPrice(product.price_cents)}
                      </p>
                      <Badge variant="secondary">{product.status}</Badge>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onAddToCart(product)}
                    >
                      Add to cart
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
