import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { getAdmin } from "@/lib/server/admin";
import {
  PERIODES,
  chiffres,
  derniersComptes,
  dernieresOeuvres,
  entonnoir,
  type ParPeriode,
  type Periode,
} from "@/lib/server/tableauDeBord";

/** Comme le reste de l'admin : ni index, ni sitemap, et 404 sans session. */
export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const euros = (centimes: number) =>
  (centimes / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const date = (d: Date) =>
  d.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const taux = (numerateur: number, denominateur: number) =>
  denominateur === 0 ? "—" : `${Math.round((numerateur / denominateur) * 100)} %`;

const TH = "px-3 py-2 text-left font-semibold";
const TD = "px-3 py-2 tabular-nums";

export default async function TableauDeBordPage() {
  if (!(await getAdmin())) notFound();

  const debut = Date.now();
  const [c, e, comptes, oeuvres] = await Promise.all([
    chiffres(),
    entonnoir(),
    derniersComptes(),
    dernieresOeuvres(),
  ]);
  const duree = Date.now() - debut;

  const lignes: {
    libelle: string;
    valeurs: ParPeriode;
    format?: (n: number) => string;
    /** Périodes que la table ne couvre pas : un tiret plutôt qu'un chiffre faux. */
    absentes?: Periode[];
  }[] =
    [
      { libelle: "Comptes créés", valeurs: c.comptes },
      { libelle: "Œuvres générées", valeurs: c.oeuvres },
      { libelle: "· dont anonymes", valeurs: c.oeuvresAnonymes },
      { libelle: "· dont d'un compte", valeurs: c.oeuvresCompte },
      { libelle: "Œuvres débloquées (payées)", valeurs: c.oeuvresDebloquees },
      { libelle: "Achats", valeurs: c.achats },
      { libelle: "Chiffre d'affaires", valeurs: c.chiffreAffaires, format: euros },
      { libelle: "Aperçus consommés *", valeurs: c.apercus, absentes: ["j28", "total"] },
    ];

  const marches = [
    { libelle: "Œuvres générées", valeur: e.oeuvres, base: null },
    { libelle: "Propriétaires distincts", valeur: e.proprietaires, base: e.oeuvres },
    { libelle: "Comptes ayant généré", valeur: e.comptes, base: e.proprietaires },
    { libelle: "Comptes ayant acheté", valeur: e.comptesAcheteurs, base: e.comptes },
  ];

  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Tableau de bord</h1>
            <p className="mt-1 text-sm text-muted">
              Comptes, dessins générés et achats, lus en base. Calculé en {duree} ms.
            </p>
          </div>
          <Link href="/admin/coloriages" className="text-sm font-semibold underline">
            Bibliothèque
          </Link>
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className={TH}>Chiffres</th>
                {PERIODES.map((p) => (
                  <th key={p.cle} className={`${TH} text-right`}>
                    {p.libelle}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.libelle} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{l.libelle}</td>
                  {PERIODES.map((p) => (
                    <td key={p.cle} className={`${TD} text-right`}>
                      {l.absentes?.includes(p.cle)
                        ? "—"
                        : (l.format ?? String)(l.valeurs[p.cle])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 pb-3 text-xs text-muted">
            Les essais non payés de plus de 30 jours peuvent avoir été effacés
            (purge occasionnelle) : pour les œuvres générées, « Depuis le début »
            peut sous-compter ; 24 h, 7 j et 28 j sont complets. « Anonymes » et
            « d&apos;un compte » suivent le propriétaire actuel : un essai réclamé
            à la connexion passe côté compte. Les œuvres payées sont datées du
            déblocage. * Les aperçus sont comptés par jour calendaire et purgés
            après 7 jours : « 24 h » vaut « aujourd&apos;hui » (jour de la base de
            données), 28 j et le total
            ne sont pas connus.
          </p>
        </Card>

        <section>
          <h2 className="font-display text-xl font-bold">Entonnoir sur 28 jours</h2>
          <Card className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th className={TH}>Marche</th>
                  <th className={`${TH} text-right`}>Nombre</th>
                  <th className={`${TH} text-right`}>Taux depuis la marche précédente</th>
                </tr>
              </thead>
              <tbody>
                {marches.map((m) => (
                  <tr key={m.libelle} className="border-b border-line last:border-0">
                    <td className="px-3 py-2">{m.libelle}</td>
                    <td className={`${TD} text-right`}>{m.valeur}</td>
                    <td className={`${TD} text-right`}>
                      {m.base === null ? "" : taux(m.valeur, m.base)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-3 pb-3 text-xs text-muted">
              Propriétaire actuel de chaque œuvre : un essai anonyme réclamé à la
              connexion compte côté compte. Achat : au moins un achat dans les 28 jours.
              Les comptes créés sans rien générer sont dans « Comptes créés » plus haut.
            </p>
          </Card>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">
            Les {comptes.length} derniers comptes
          </h2>
          <Card className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th className={TH}>Créé le</th>
                  <th className={TH}>E-mail</th>
                  <th className={`${TH} text-right`}>Crédits</th>
                  <th className={`${TH} text-right`}>Œuvres</th>
                  <th className={`${TH} text-right`}>Achats</th>
                  <th className={`${TH} text-right`}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {comptes.map((compte) => (
                  <tr key={compte.id} className="border-b border-line last:border-0">
                    <td className={TD}>{date(compte.creeLe)}</td>
                    <td className="px-3 py-2">{compte.email ?? "—"}</td>
                    <td className={`${TD} text-right`}>{compte.credits}</td>
                    <td className={`${TD} text-right`}>{compte.oeuvres}</td>
                    <td className={`${TD} text-right`}>{compte.achats}</td>
                    <td className={`${TD} text-right`}>{euros(compte.montant)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {comptes.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted">Aucun compte.</p>
            )}
          </Card>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">
            Les {oeuvres.length} dernières œuvres
          </h2>
          <Card className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th className={TH}>Vignette</th>
                  <th className={TH}>Créée le</th>
                  <th className={TH}>Propriétaire</th>
                  <th className={TH}>Payée</th>
                </tr>
              </thead>
              <tbody>
                {oeuvres.map((oeuvre) => (
                  <tr key={oeuvre.id} className="border-b border-line last:border-0">
                    <td className="px-3 py-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- route admin gardée, sans optimiseur */}
                      <img
                        src={`/api/admin/oeuvres/${encodeURIComponent(oeuvre.id)}/vignette`}
                        alt="fichier introuvable"
                        width={80}
                        loading="lazy"
                        className="h-auto w-20 border border-line bg-white"
                      />
                    </td>
                    <td className={TD}>{date(oeuvre.creeLe)}</td>
                    <td className="px-3 py-2">{oeuvre.proprietaire}</td>
                    <td className="px-3 py-2">{oeuvre.payee ? "oui" : "non"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {oeuvres.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted">Aucune œuvre.</p>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}
