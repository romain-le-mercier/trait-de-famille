"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Eye,
  RefreshCw,
  Square,
  Wand2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { cx } from "@/lib/cx";

import type { DetailLevel } from "@/lib/lineart/types";

type Statut = "brouillon" | "publie" | "rejete";

interface Sujet {
  slug: string;
  titre: string;
  nom: string;
  difficulte: DetailLevel;
  statut: Statut | null;
  genereLe: number | null;
}

interface ThemeOption {
  slug: string;
  nom: string;
  total: number;
}

const LIBELLES: Record<Statut, { texte: string; ton: "tangerine" | "success" | "ink" }> =
  {
    brouillon: { texte: "À relire", ton: "tangerine" },
    publie: { texte: "En ligne", ton: "success" },
    rejete: { texte: "Rejeté", ton: "ink" },
  };

export function AdminColoriages({ themes }: { themes: ThemeOption[] }) {
  const [theme, setTheme] = useState(themes[0]?.slug ?? "");
  const [sujets, setSujets] = useState<Sujet[]>([]);
  const [moteurPret, setMoteurPret] = useState<boolean | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  /** Sujet en cours de génération, et compteur du lot. */
  const [enCours, setEnCours] = useState<string | null>(null);
  const [avancement, setAvancement] = useState<{ fait: number; total: number } | null>(
    null,
  );
  const stop = useRef(false);

  /**
   * Force le rechargement des vignettes après une régénération : l'URL ne
   * change pas, et le navigateur resservirait l'ancienne image.
   */
  const [versions, setVersions] = useState<Record<string, number>>({});

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const reponse = await fetch(`/api/admin/coloriages?theme=${theme}`, {
        cache: "no-store",
      });
      if (!reponse.ok) throw new Error("Chargement impossible.");
      const data = await reponse.json();
      setSujets(data.sujets ?? []);
      setMoteurPret(Boolean(data.moteurPret));
    } catch (caught) {
      setErreur(caught instanceof Error ? caught.message : "Chargement impossible.");
    } finally {
      setChargement(false);
    }
  }, [theme]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const genererUn = useCallback(
    async (slug: string) => {
      setEnCours(slug);
      setErreur(null);
      try {
        const reponse = await fetch("/api/admin/coloriages/generer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, slug }),
        });
        const data = await reponse.json().catch(() => null);
        if (!reponse.ok) throw new Error(data?.message ?? "La génération a échoué.");

        setSujets((current) =>
          current.map((sujet) =>
            sujet.slug === slug
              ? { ...sujet, statut: "brouillon", genereLe: Date.now() }
              : sujet,
          ),
        );
        setVersions((current) => ({ ...current, [slug]: (current[slug] ?? 0) + 1 }));
        return true;
      } catch (caught) {
        setErreur(caught instanceof Error ? caught.message : "La génération a échoué.");
        return false;
      } finally {
        setEnCours(null);
      }
    },
    [theme],
  );

  /**
   * Le lot est enchaîné ici, un sujet à la fois, et non côté serveur : chaque
   * appel coûte, il faut pouvoir le voir passer et l'arrêter.
   *
   * Un échec interrompt tout. Si le moteur est en panne, continuer ne ferait
   * qu'aligner trente erreurs.
   */
  const genererLot = useCallback(
    async (slugs: string[]) => {
      stop.current = false;
      setAvancement({ fait: 0, total: slugs.length });
      for (const [index, slug] of slugs.entries()) {
        if (stop.current) break;
        const ok = await genererUn(slug);
        setAvancement({ fait: index + 1, total: slugs.length });
        if (!ok) break;
      }
      setAvancement(null);
    },
    [genererUn],
  );

  const changerStatut = useCallback(async (slug: string, statut: Statut) => {
    setErreur(null);
    try {
      const reponse = await fetch("/api/admin/coloriages/statut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, statut }),
      });
      if (!reponse.ok) {
        const data = await reponse.json().catch(() => null);
        throw new Error(data?.message ?? "Enregistrement impossible.");
      }
      setSujets((current) =>
        current.map((sujet) => (sujet.slug === slug ? { ...sujet, statut } : sujet)),
      );
    } catch (caught) {
      setErreur(
        caught instanceof Error ? caught.message : "Enregistrement impossible.",
      );
    }
  }, []);

  const compte = useMemo(() => {
    const par = (statut: Statut | null) =>
      sujets.filter((sujet) => sujet.statut === statut).length;
    return {
      aGenerer: par(null),
      brouillons: par("brouillon"),
      publies: par("publie"),
      rejetes: par("rejete"),
    };
  }, [sujets]);

  const manquants = sujets.filter((sujet) => sujet.statut === null);
  const brouillons = sujets.filter((sujet) => sujet.statut === "brouillon");
  const aRelire = brouillons[0] ?? null;
  const occupe = enCours !== null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Bibliothèque</h1>
          <p className="mt-1 text-sm text-muted">
            Les sujets viennent du dépôt. Les dessins sont générés ici et ne
            paraissent qu&apos;une fois relus.
          </p>
        </div>
        <div className="flex gap-2">
          {themes.map((option) => (
            <Button
              key={option.slug}
              size="sm"
              variant={option.slug === theme ? "primary" : "ink"}
              onClick={() => setTheme(option.slug)}
              disabled={occupe}
            >
              {option.nom} ({option.total})
            </Button>
          ))}
        </div>
      </div>

      {moteurPret === false && (
        <p className="mt-5 flex items-start gap-2 rounded-tile border-2 border-error bg-error/8 p-3 text-sm font-semibold">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" strokeWidth={2.2} />
          Le moteur n&apos;est pas configuré sur ce serveur : aucune génération
          n&apos;est possible.
        </p>
      )}

      {erreur && (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-tile border-2 border-error bg-error/8 p-3 text-sm font-semibold"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" strokeWidth={2.2} />
          {erreur}
        </p>
      )}

      {/* --- Barre de lot ------------------------------------------------ */}
      <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge tone="ink">{compte.aGenerer} à générer</Badge>
          <Badge tone="tangerine">{compte.brouillons} à relire</Badge>
          <Badge tone="success">{compte.publies} en ligne</Badge>
          {compte.rejetes > 0 && <Badge tone="ink">{compte.rejetes} rejetés</Badge>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {avancement && (
            <span className="text-sm font-bold">
              {avancement.fait} / {avancement.total}
              {enCours && <span className="ml-2 text-muted">· {enCours}</span>}
            </span>
          )}
          {avancement ? (
            <Button size="sm" variant="ink" onClick={() => (stop.current = true)}>
              <Square className="h-4 w-4" strokeWidth={2.2} />
              Arrêter
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => void genererLot(manquants.map((s) => s.slug))}
              disabled={occupe || manquants.length === 0 || moteurPret !== true}
            >
              <Wand2 className="h-4 w-4" strokeWidth={2.2} />
              Générer les {manquants.length} manquants
            </Button>
          )}
          <Button size="sm" variant="ink" onClick={() => void charger()} disabled={occupe}>
            <RefreshCw className={cx("h-4 w-4", chargement && "spin-slow")} strokeWidth={2.2} />
            Rafraîchir
          </Button>
        </div>
      </Card>

      {/* --- Relecture, un dessin à la fois ------------------------------ */}
      {aRelire && (
        <Card className="mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <Eye className="h-5 w-5 text-grape" strokeWidth={2} />
              À relire
            </h2>
            <span className="text-sm text-muted">
              {brouillons.length} en attente
            </span>
          </div>

          <div className="mt-4 grid gap-5 md:grid-cols-[1.2fr_1fr]">
            <div className="overflow-hidden rounded-tile border-2 border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/admin/coloriages/image/${aRelire.slug}?v=${versions[aRelire.slug] ?? 0}`}
                alt={aRelire.titre}
                className="mx-auto max-h-[70vh] w-auto"
              />
            </div>

            <div className="flex flex-col">
              <p className="font-display text-lg font-bold">{aRelire.titre}</p>
              <p className="mt-1 text-sm text-muted">{aRelire.nom}</p>

              <ul className="mt-4 space-y-1.5 text-sm text-muted">
                <li>· Les contours sont-ils tous fermés ?</li>
                <li>· Y a-t-il du gris, une ombre ou une trame ?</li>
                <li>· Le sujet est-il entier et centré ?</li>
                <li>· Aucun texte parasite dans l&apos;image ?</li>
              </ul>

              <div className="mt-6 flex flex-col gap-2">
                <Button
                  full
                  onClick={() => void changerStatut(aRelire.slug, "publie")}
                  disabled={occupe}
                >
                  <Check className="h-4 w-4" strokeWidth={2.4} />
                  Publier
                </Button>
                <Button
                  full
                  variant="ink"
                  onClick={() => void genererUn(aRelire.slug)}
                  disabled={occupe || moteurPret !== true}
                >
                  <RefreshCw
                    className={cx("h-4 w-4", enCours === aRelire.slug && "spin-slow")}
                    strokeWidth={2.2}
                  />
                  {enCours === aRelire.slug ? "On dessine…" : "Régénérer"}
                </Button>
                <Button
                  full
                  variant="ghost"
                  onClick={() => void changerStatut(aRelire.slug, "rejete")}
                  disabled={occupe}
                >
                  <X className="h-4 w-4" strokeWidth={2.4} />
                  Rejeter
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* --- Vue d'ensemble ---------------------------------------------- */}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sujets.map((sujet) => (
          <Card as="li" key={sujet.slug} className="flex flex-col gap-3 p-4">
            <div className="relative overflow-hidden rounded-tile border-2 border-line bg-white">
              {sujet.statut ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/admin/coloriages/image/${sujet.slug}?v=${versions[sujet.slug] ?? 0}`}
                  alt={sujet.titre}
                  className="aspect-square w-full object-contain"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-paper text-sm text-muted">
                  {enCours === sujet.slug ? "On dessine…" : "Pas encore dessiné"}
                </div>
              )}
              {sujet.statut && (
                <Badge tone={LIBELLES[sujet.statut].ton} className="absolute left-2 top-2">
                  {LIBELLES[sujet.statut].texte}
                </Badge>
              )}
            </div>

            <div className="flex-1">
              <p className="font-display text-sm font-bold">{sujet.titre}</p>
              <p className="text-xs text-muted">{sujet.difficulte}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={sujet.statut ? "ink" : "primary"}
                onClick={() => void genererUn(sujet.slug)}
                disabled={occupe || moteurPret !== true}
              >
                <Wand2 className="h-4 w-4" strokeWidth={2.2} />
                {sujet.statut ? "Régénérer" : "Générer"}
              </Button>
              {sujet.statut === "publie" && (
                <a
                  href={`/coloriages/${theme}/${sujet.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-grape underline decoration-2 underline-offset-4"
                >
                  Voir
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.2} />
                </a>
              )}
              {sujet.statut === "rejete" && (
                <button
                  type="button"
                  onClick={() => void changerStatut(sujet.slug, "brouillon")}
                  className="text-sm font-bold text-muted underline decoration-2 underline-offset-4"
                  disabled={occupe}
                >
                  Remettre à relire
                </button>
              )}
            </div>

            {sujet.statut === "publie" && (
              <p className="truncate text-[11px] text-muted">

              </p>
            )}
          </Card>
        ))}
      </ul>
    </div>
  );
}
