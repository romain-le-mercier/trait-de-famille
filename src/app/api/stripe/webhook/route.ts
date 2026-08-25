import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPack } from "@/lib/pricing";
import { grantCredits } from "@/lib/server/accounts";

/**
 * Webhook Stripe — la source de vérité du paiement.
 *
 * C'est le seul signal fiable si l'utilisateur ferme l'onglet avant de revenir
 * sur /merci. Il crédite via `grantCredits`, idempotent sur l'identifiant de
 * session, donc il peut arriver avant ou après la vérification côté retour
 * sans jamais créditer deux fois.
 *
 * En local :
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 */
export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ message: "Webhook non configuré." }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Signature absente." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("[webhook] signature invalide", error);
    return NextResponse.json({ message: "Signature invalide." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object;
    const userId = checkout.metadata?.userId ?? checkout.client_reference_id;
    const packId = checkout.metadata?.packId ?? "";
    const pack = getPack(packId);
    const credits = pack?.credits ?? Number(checkout.metadata?.credits ?? 0);

    if (!userId || !credits) {
      // Rien à créditer : on acquitte quand même pour ne pas faire boucler Stripe.
      console.warn("[webhook] session sans compte ou sans crédits", checkout.id);
      return NextResponse.json({ received: true });
    }

    if (checkout.payment_status !== "paid") {
      console.warn("[webhook] session non payée", checkout.id, checkout.payment_status);
      return NextResponse.json({ received: true });
    }

    const result = await grantCredits({
      identity: {
        id: userId,
        email: checkout.customer_details?.email ?? null,
        name: checkout.customer_details?.name ?? null,
      },
      sessionId: checkout.id,
      packId,
      credits,
      amount: checkout.amount_total ?? pack?.amount ?? 0,
    });

    console.log(
      "[webhook] paiement confirmé",
      checkout.id,
      result.granted ? `+${credits} crédits` : "déjà crédité",
      `solde ${result.credits}`,
    );
  }

  return NextResponse.json({ received: true });
}
