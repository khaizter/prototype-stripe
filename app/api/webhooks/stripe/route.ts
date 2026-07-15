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

  // TODO: Handle events incrementally as you learn Stripe.
  // switch (event.type) {
  //   case "checkout.session.completed":
  //   case "customer.subscription.created":
  //   case "customer.subscription.updated":
  //   case "customer.subscription.deleted":
  //   case "invoice.paid":
  //     break;
  //   default:
  //     break;
  // }

  return NextResponse.json({ received: true });
}
