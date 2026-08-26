import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { THEMES } from "@/lib/coloriages/themes";
import { getAdmin } from "@/lib/server/admin";
import { AdminColoriages } from "./AdminColoriages";

/**
 * L'administration ne doit apparaître nulle part : ni dans l'index, ni dans le
 * sitemap, ni dans les suggestions. `robots.ts` interdit /admin en plus.
 */
export const metadata: Metadata = {
  title: "Bibliothèque",
  robots: { index: false, follow: false },
};

// Le contrôle d'accès lit la session : la page ne peut pas être statique.
export const dynamic = "force-dynamic";

export default async function AdminColoriagesPage() {
  // 404 plutôt que 403 : inutile d'annoncer qu'une administration existe.
  if (!(await getAdmin())) notFound();

  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <AdminColoriages
        themes={THEMES.map((theme) => ({
          slug: theme.slug,
          nom: theme.nom,
          total: theme.sujets.length,
        }))}
      />
    </main>
  );
}
