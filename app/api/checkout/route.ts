import { NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type CheckoutItem = {
  productId: string;
  name: string;
  description?: string;
  price_cents: number;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = (await request.json()) as { items?: CheckoutItem[] };
    const items = body.items ?? [];

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    for (const item of items) {
      if (
        !item.productId ||
        !item.name ||
        !Number.isInteger(item.price_cents) ||
        item.price_cents < 0
      ) {
        return NextResponse.json(
          { error: "Invalid cart item." },
          { status: 400 },
        );
      }
    }

    const productIds = items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, status")
      .in("id", productIds);

    if (productsError) {
      return NextResponse.json(
        { error: productsError.message },
        { status: 500 },
      );
    }

    const availableIds = new Set(
      (products ?? [])
        .filter((product) => product.status === "available")
        .map((product) => product.id),
    );

    if (
      productIds.length !== availableIds.size ||
      productIds.some((id) => !availableIds.has(id))
    ) {
      return NextResponse.json(
        { error: "Some items are no longer available." },
        { status: 409 },
      );
    }

    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      // Inline prices from cart — no pre-created Stripe Price IDs needed.
      line_items: items.map((item) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: item.price_cents,
          product_data: {
            name: item.name,
            description: item.description || undefined,
            metadata: {
              product_id: item.productId,
            },
          },
        },
      })),
      metadata: {
        user_id: user.id,
        product_ids: productIds.join(","),
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }

    // Client redirects with window.location (fetch cannot usefully follow Stripe's URL).
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed.";
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : 500;

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
