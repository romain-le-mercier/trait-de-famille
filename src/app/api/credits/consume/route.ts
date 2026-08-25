import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { consumeCredit, refundCredit } from "@/lib/server/accounts";

/**
 * Dépense un crédit. Appelé par le client une fois le fichier prêt, jamais
 * avant : ainsi un échec de préparation ne fait perdre aucun crédit.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Connecte-toi pour débloquer ton coloriage." },
      { status: 401 },
    );
  }

  const identity = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
  const result = await consumeCredit(identity);

  if (!result.ok) {
    return NextResponse.json(
      { message: "Tu n'as plus de crédit.", credits: result.credits },
      { status: 402 },
    );
  }

  return NextResponse.json({ credits: result.credits });
}

/** Filet de sécurité : rend le crédit si le client n'a pas pu finaliser. */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }
  const credits = await refundCredit({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });
  return NextResponse.json({ credits });
}
