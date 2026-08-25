import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** Identifiant Google stable (`sub`), clé du compte côté serveur. */
      id: string;
    } & DefaultSession["user"];
  }
}
