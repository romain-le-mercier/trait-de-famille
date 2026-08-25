import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth, authConfigured } from "@/auth";
import { getPack } from "@/lib/pricing";

/** Indique au client si le paiement réel et le SSO sont configurés. */
export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  return NextResponse.json({
    enabled: Boolean(secretKey),
    // Utile pour savoir si on travaille en test ou en réel.
    mode: secretKey.startsWith("sk_live") ? "live" : secretKey ? "test" : null,
    authConfigured,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pack = getPack(String(body?.packId ?? ""));

  if (!pack) {
    return NextResponse.json({ message: "Offre inconnue." }, { status: 400 });
  }

  // Les crédits sont rattachés à un compte : sans compte, pas d'achat.
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Connecte-toi pour acheter des crédits.", needsAuth: true },
      { status: 401 },
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      {
        stripeMissing: true,
        message: "Le paiement n'est pas configuré sur ce serveur.",
      },
      { status: 501 },
    );
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  try {
    const stripe = new Stripe(secretKey);
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      // Apple Pay / Google Pay apparaissent automatiquement dans Checkout
      // sur les appareils compatibles, sans code supplémentaire.
      customer_email: session.user.email ?? undefined,
      client_reference_id: session.user.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: pack.amount,
            product_data: {
              name: `Trait de Famille — ${pack.name}`,
              description:
                pack.credits > 1
                  ? `${pack.credits} coloriages HD à imprimer`
                  : "1 coloriage HD à imprimer",
            },
          },
        },
      ],
      metadata: {
        packId: pack.id,
        credits: String(pack.credits),
        userId: session.user.id,
      },
      allow_promotion_codes: true,
      success_url: `${origin}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/debloquer?annule=1`,
    });

    if (!checkout.url) throw new Error("Stripe n'a pas renvoyé d'URL");
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[checkout]", error);
    return NextResponse.json(
      { message: "Le paiement n'a pas pu démarrer. Réessaie dans un instant." },
      { status: 502 },
    );
  }
}
