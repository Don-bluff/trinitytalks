import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
]);

/**
 * Upsert user_subscriptions — same schema as bluffcatcher
 */
async function activateSubscription(
  userId: string,
  subscriptionId: string,
  customerId: string | null,
  periodStart: string,
  periodEnd: string | null
) {
  const { error } = await getAdmin().from("user_subscriptions").upsert(
    {
      user_id: userId,
      plan: "pro",
      status: "active",
      provider: "stripe",
      provider_sub_id: subscriptionId,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) {
    console.error("❌ user_subscriptions upsert failed:", error);
    throw new Error(`activateSubscription failed: ${error.message}`);
  }
  console.log(`✅ Activated subscription for user ${userId} (sub: ${subscriptionId}, customer: ${customerId})`);
}

async function deactivateSubscription(subscriptionId: string) {
  const { data, error: queryError } = await getAdmin()
    .from("user_subscriptions")
    .select("user_id")
    .eq("provider_sub_id", subscriptionId)
    .single();

  if (queryError) {
    if (queryError.code === "PGRST116") {
      console.warn(`Subscription ${subscriptionId} not found in user_subscriptions`);
      return;
    }
    throw new Error(`Query failed: ${queryError.message}`);
  }

  if (!data) return;

  const { error } = await getAdmin()
    .from("user_subscriptions")
    .update({
      plan: "free",
      status: "expired",
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", data.user_id);

  if (error) throw new Error(`deactivateSubscription failed: ${error.message}`);
  console.log(`🔌 Deactivated subscription for user ${data.user_id}`);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: `Signature verification failed: ${msg}` }, { status: 400 });
  }

  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  console.log(`--- Webhook: ${event.type} ---`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== "paid") break;

        const userId = session.metadata?.userId;
        if (!userId) {
          console.error("❌ No userId in checkout metadata", session.id);
          break;
        }

        const subId = session.subscription as string;
        if (subId) {
          // Fetch subscription for period info
          const sub = await getStripe().subscriptions.retrieve(subId);
          const item = sub.items.data[0];
          const periodStart = new Date((item?.current_period_start || Math.floor(Date.now() / 1000)) * 1000).toISOString();
          const periodEnd = item?.current_period_end
            ? new Date(item.current_period_end * 1000).toISOString()
            : null;

          await activateSubscription(
            userId,
            subId,
            session.customer as string,
            periodStart,
            periodEnd
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // @ts-expect-error - Stripe type issue
        const subId = invoice.subscription as string;
        if (!subId) break;

        const sub = await getStripe().subscriptions.retrieve(subId);
        const userId = sub.metadata?.userId;
        if (!userId) {
          console.warn("⚠️ No userId in subscription metadata for invoice", invoice.id);
          break;
        }

        const item = sub.items.data[0];
        const periodStart = new Date((item?.current_period_start || Math.floor(Date.now() / 1000)) * 1000).toISOString();
        const periodEnd = item?.current_period_end
          ? new Date(item.current_period_end * 1000).toISOString()
          : null;

        await activateSubscription(userId, subId, sub.customer as string, periodStart, periodEnd);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        if (sub.status === "canceled" || sub.status === "unpaid") {
          await deactivateSubscription(sub.id);
        } else if (sub.status === "active") {
          const item = sub.items.data[0];
          const periodStart = new Date((item?.current_period_start || Math.floor(Date.now() / 1000)) * 1000).toISOString();
          const periodEnd = item?.current_period_end
            ? new Date(item.current_period_end * 1000).toISOString()
            : null;

          await activateSubscription(userId, sub.id, sub.customer as string, periodStart, periodEnd);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await deactivateSubscription(sub.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // @ts-expect-error - Stripe type issue
        const subId = invoice.subscription as string;
        if (!subId) break;

        const sub = await getStripe().subscriptions.retrieve(subId);
        if (sub.status === "canceled" || sub.status === "unpaid") {
          await deactivateSubscription(subId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown";
    console.error(`❌ Webhook error (${event.type}):`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
