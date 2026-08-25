import { NextResponse } from "next/server";
import { auth, authConfigured } from "@/auth";
import { getAccount } from "@/lib/server/accounts";

/** État du compte courant : c'est la source de vérité pour les crédits. */
export async function GET() {
  if (!authConfigured) {
    return NextResponse.json({
      authConfigured: false,
      signedIn: false,
      credits: 0,
    });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ authConfigured: true, signedIn: false, credits: 0 });
  }

  const account = await getAccount({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });

  return NextResponse.json({
    authConfigured: true,
    signedIn: true,
    user: {
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
    },
    credits: account.credits,
    purchases: account.purchases.slice(0, 20),
  });
}
