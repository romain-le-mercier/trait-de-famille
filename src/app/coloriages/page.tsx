import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Printer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/marketing/SectionTitle";
import { EtSiCetaitToi } from "@/components/coloriages/EtSiCetaitToi";
import { nomFichierImage, THEMES } from "@/lib/coloriages/themes";
import { listerPublies } from "@/lib/server/coloriages";

export const metadata: Metadata = {
  title: "Coloriages gratuits à imprimer",
  description:
    "Des coloriages gratuits à imprimer en A4 : contours nets, zones fermées, prêts pour les feutres. Et si tu veux le tien, envoie une photo de famille.",
  alternates: { canonical: "/coloriages" },
};

/**
 * La bibliothèque lit la base, qui n'est pas joignable au moment du build :
 * ces pages sont donc rendues à la demande. Le poids réel — les images — est
 * mis en cache une journée par sa propre route, et c'est là que ça compte.
 */
export const dynamic = "force-dynamic";

export default async function ColoriagesPage() {
  const publies = await listerPublies();
  const parTheme = new Map<string, { slug: string; fichier: string }[]>();
  for (const dessin of publies) {
    parTheme.set(dessin.theme, [
      ...(parTheme.get(dessin.theme) ?? []),
      { slug: dessin.slug, fichier: nomFichierImage(dessin.slug, dessin.mime) },
    ]);
  }

  const themes = THEMES.map((theme) => ({
    ...theme,
    dessins: parTheme.get(theme.slug) ?? [],
  })).filter((theme) => theme.dessins.length > 0);

  return (
    <div className="mx-auto max-w-5xl">
      <SectionTitle
        eyebrow="Gratuit"
        title="Des coloriages à imprimer, tout de suite."
        subtitle="Contours nets, zones fermées, format A4. À télécharger en PDF ou en PNG, sans compte et sans rien payer."
      />

      {themes.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-display text-xl font-semibold">
            Les premiers dessins arrivent très bientôt.
          </p>
          <p className="mt-2 text-muted">
            En attendant, tu peux transformer une de tes photos en coloriage.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {themes.map((theme) => (
            <Card as="li" key={theme.slug} className="p-0">
              <Link
                href={`/coloriages/${theme.slug}`}
                className="flex h-full flex-col p-6 transition-colors hover:bg-paper"
              >
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {theme.dessins.slice(0, 3).map((dessin) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={dessin.slug}
                      src={`/coloriages/image/${dessin.fichier}`}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="aspect-square w-full rounded-tile border-2 border-line bg-white object-contain"
                    />
                  ))}
                </div>
                <h2 className="font-display text-xl font-bold">{theme.nom}</h2>
                <p className="mt-2 flex-1 text-sm text-muted">{theme.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-grape">
                  {theme.dessins.length} coloriages
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </span>
              </Link>
            </Card>
          ))}
        </ul>
      )}

      <Card tone="soft" className="mt-8 bg-paper p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Printer className="h-5 w-5 text-grape" strokeWidth={2} />
          Pour une belle impression
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          <li>· Imprime en A4, à 100 % (sans « ajuster à la page »)</li>
          <li>· Un papier un peu épais (120 g+) évite que les feutres traversent</li>
          <li>· Le PDF est déjà mis en page : c&apos;est le plus simple</li>
        </ul>
      </Card>

      <div className="mt-10">
        <EtSiCetaitToi />
      </div>
    </div>
  );
}
