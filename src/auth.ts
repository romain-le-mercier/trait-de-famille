import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Authentification par compte Google.
 *
 * Session en JWT (pas d'adaptateur de base de données) : le cookie porte
 * l'identité, et c'est l'identifiant Google stable (`sub`) qui sert de clé
 * pour les crédits côté serveur (voir src/lib/server/accounts.ts).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/connexion" },
  callbacks: {
    jwt({ token, profile }) {
      if (profile?.sub) token.sub = profile.sub;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

/** Vrai si le SSO est configuré : sinon l'app le signale au lieu de planter. */
export const authConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.AUTH_SECRET,
);
