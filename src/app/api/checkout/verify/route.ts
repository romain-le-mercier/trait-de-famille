import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { getPack } from "@/lib/pricing";
import { grantCredits } from "@/lib/server/accounts";

/**
 * Vérifie auprès de Stripe qu'une session est payée, puis crédite le compte.
 *
 * Le webhook fait la même chose de son côté ; les deux passent par
 * `grantCredits`, idempotent sur l'identifiant de session. Celui qui arrive le
 * premier crédite, l'autre constate que c'est déjà fait. C'est ce qui permet
 * d'afficher le bon solde immédiatement au retour de paiement, sans dépendre
 * du délai du webhook.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const sessionId = String(body?.sessionId ?? "");

  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ message: "Session invalide." }, { status: 400 });
  }

  const authSession = await auth();
  if (!authSession?.user?.id) {
    return NextResponse.json(
      { message: "Connecte-toi pour récupérer tes crédits.", needsAuth: true },
      { status: 401 },
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { message: "Stripe n'est pas configuré." },
      { status: 501 },
    );
  }

  try {
    const stripe = new Stripe(secretKey);
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkout.payment_status !== "paid") {
      return NextResponse.json(
        { paid: false, message: "Le paiement n'est pas encore confirmé." },
        { status: 402 },
      );
    }

    // Le paiement doit appartenir au compte connecté.
    const owner = checkout.metadata?.userId ?? checkout.client_reference_id;
    if (owner && owner !== authSession.user.id) {
      return NextResponse.json(
        { message: "Ce paiement est rattaché à un autre compte." },
        { status: 403 },
      );
    }

    const packId = checkout.metadata?.packId ?? "";
    const pack = getPack(packId);
    const credits = pack?.credits ?? Number(checkout.metadata?.credits ?? 0);

    if (!credits) {
      return NextResponse.json(
        { message: "Impossible de retrouver l'offre achetée." },
        { status: 422 },
      );
    }

    const result = await grantCredits({
      identity: {
        id: authSession.user.id,
        email: authSession.user.email,
        name: authSession.user.name,
      },
      sessionId,
      packId,
      credits,
      amount: checkout.amount_total ?? pack?.amount ?? 0,
    });

    return NextResponse.json({
      paid: true,
      packId,
      packName: pack?.name ?? "Crédits",
      creditsAdded: result.granted ? credits : 0,
      credits: result.credits,
    });
  } catch (error) {
    console.error("[checkout/verify]", error);
    return NextResponse.json(
      { message: "Vérification impossible pour le moment." },
      { status: 502 },
    );
  }
}
