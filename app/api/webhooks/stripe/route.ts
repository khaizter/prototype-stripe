import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import type { Json } from "@/types/database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook configuration." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Persist every event so you can inspect rows in the Supabase dashboard.
  const { error: insertError } = await supabase.from("webhook_events").insert({
    stripe_event_id: event.id,
    type: event.type,
    payload: event as unknown as Json,
  });

  if (insertError) {
    console.error("Failed to store webhook event:", insertError.message);
    return NextResponse.json(
      { error: "Failed to store webhook event." },
      { status: 500 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const productIds =
      session.metadata?.product_ids
        ?.split(",")
        .map((id) => id.trim())
        .filter(Boolean) ?? [];

    if (productIds.length > 0) {
      const { error: soldError } = await supabase
        .from("products")
        .update({ status: "sold" })
        .in("id", productIds)
        .eq("status", "available");

      if (soldError) {
        console.error("Failed to mark products sold:", soldError.message);
        await supabase
          .from("webhook_events")
          .update({
            processed: false,
            error: soldError.message,
          })
          .eq("stripe_event_id", event.id);

        return NextResponse.json(
          { error: "Failed to mark products sold." },
          { status: 500 },
        );
      }
    }

    await supabase
      .from("webhook_events")
      .update({ processed: true })
      .eq("stripe_event_id", event.id);
  }

  return NextResponse.json({ received: true });
}
