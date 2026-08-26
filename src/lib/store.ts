"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SETTINGS, type LineArtSettings } from "./lineart/types";

export interface Draft {
  id: string;
  fileName: string;
  /** Dimensions de la photo source, après orientation EXIF. */
  width: number;
  height: number;
  settings: LineArtSettings;
  createdAt: number;
}

/**
 * Un dessin produit par le modèle.
 *
 * Il entre dans la galerie dès la génération, verrouillé : c'est un essai,
 * filigrané. `unlocked` passe à true quand un crédit a été dépensé pour lui —
 * le fichier livré est alors exactement le même, jamais régénéré. C'est tout
 * l'intérêt de le garder : le modèle ne redonne pas deux fois la même image.
 */
export interface GalleryItem {
  id: string;
  /** La photo dont il est issu : plusieurs essais peuvent la partager. */
  draftId: string;
  fileName: string;
  createdAt: number;
  settings: LineArtSettings;
  unlocked: boolean;
}

export interface AccountState {
  loaded: boolean;
  authConfigured: boolean;
  signedIn: boolean;
  credits: number;
  user: { name: string | null; email: string | null; image: string | null } | null;
}

const EMPTY_ACCOUNT: AccountState = {
  loaded: false,
  authConfigured: true,
  signedIn: false,
  credits: 0,
  user: null,
};

/**
 * Ce qu'on retient d'une photo à l'autre. Le recadrage et l'effacement du
 * décor, eux, ne se reportent pas : ils dépendent de la photo.
 */
export type SettingsPreset = Pick<LineArtSettings, "detail" | "stroke">;

interface AppState {
  items: GalleryItem[];
  draft: Draft | null;

  /**
   * L'essai que l'utilisateur veut débloquer, mis de côté avant de partir
   * payer. Il est persisté, donc il survit à l'aller-retour vers Stripe : au
   * retour, l'écran de remerciement sait quel dessin livrer.
   */
  pendingUnlockId: string | null;

  /** Derniers réglages choisis, réappliqués à la prochaine photo. */
  lastSettings: SettingsPreset;

  /** Compte et solde de crédits : lus du serveur, jamais persistés ici. */
  account: AccountState;
  refreshAccount: () => Promise<AccountState>;
  setCredits: (credits: number) => void;

  setDraft: (draft: Draft) => void;
  patchDraft: (patch: Partial<Draft>) => void;
  setSettings: (settings: LineArtSettings) => void;
  clearDraft: () => void;
  upsertItem: (item: GalleryItem) => void;
  markUnlocked: (id: string) => void;
  removeItem: (id: string) => void;
  setPendingUnlock: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      items: [],
      draft: null,
      pendingUnlockId: null,
      account: EMPTY_ACCOUNT,
      lastSettings: {
        detail: DEFAULT_SETTINGS.detail,
        stroke: DEFAULT_SETTINGS.stroke,
      },

      refreshAccount: async () => {
        try {
          const response = await fetch("/api/me", { cache: "no-store" });
          const data = await response.json();
          const account: AccountState = {
            loaded: true,
            authConfigured: Boolean(data?.authConfigured),
            signedIn: Boolean(data?.signedIn),
            credits: Number(data?.credits ?? 0),
            user: data?.user ?? null,
          };
          set({ account });
          return account;
        } catch {
          const account = { ...get().account, loaded: true };
          set({ account });
          return account;
        }
      },

      setCredits: (credits) =>
        set((s) => ({ account: { ...s.account, credits } })),

      setDraft: (draft) => set({ draft }),

      patchDraft: (patch) =>
        set((s) => (s.draft ? { draft: { ...s.draft, ...patch } } : s)),

      setSettings: (settings) =>
        set((s) => ({
          draft: s.draft ? { ...s.draft, settings } : s.draft,
          lastSettings: { detail: settings.detail, stroke: settings.stroke },
        })),

      clearDraft: () => set({ draft: null }),

      // Le plus récent en tête : c'est aussi ce qui fait que la recherche
      // d'un essai par réglages tombe sur la dernière version générée.
      upsertItem: (item) =>
        set((s) => ({
          items: [item, ...s.items.filter((existing) => existing.id !== item.id)],
        })),

      markUnlocked: (id) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === id ? { ...item, unlocked: true } : item,
          ),
        })),

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((item) => item.id !== id) })),

      setPendingUnlock: (id) => set({ pendingUnlockId: id }),
    }),
    {
      name: "trait-de-famille",
      version: 2,
      // Le solde de crédits vient du serveur : rien de sensible en localStorage.
      partialize: (state) => ({
        items: state.items,
        draft: state.draft,
        lastSettings: state.lastSettings,
        pendingUnlockId: state.pendingUnlockId,
      }),
      // Sans fonction de migration, Zustand jette tout l'état persisté quand
      // la version change : les galeries existantes disparaîtraient.
      migrate: (persisted, version) => {
        const state = persisted as Partial<AppState> & {
          items?: (Omit<GalleryItem, "draftId" | "unlocked"> &
            Partial<Pick<GalleryItem, "draftId" | "unlocked">>)[];
        };
        // Jusqu'à la v1, seuls les coloriages payés entraient dans la galerie,
        // et ils portaient l'identifiant de leur brouillon.
        if (version < 2) {
          state.items = (state.items ?? []).map((item) => ({
            ...item,
            draftId: item.draftId ?? item.id,
            unlocked: true,
          }));
        }
        return state as AppState;
      },
    },
  ),
);

/**
 * Vrai une fois le localStorage relu. Évite les écarts serveur/client au
 * premier rendu (et les redirections déclenchées sur un état encore vide).
 */
export function useHydrated(): boolean {
  // Toujours false au premier rendu : le serveur ne connaît pas le
  // localStorage, on évite ainsi toute divergence d'hydratation.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
    return useAppStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}

/** Charge l'état du compte au montage, et le renvoie. */
export function useAccount(): AccountState {
  const account = useAppStore((s) => s.account);
  const refreshAccount = useAppStore((s) => s.refreshAccount);

  useEffect(() => {
    if (!account.loaded) void refreshAccount();
  }, [account.loaded, refreshAccount]);

  return account;
}

/**
 * Réglages d'une nouvelle photo : on repart des derniers choix de trait et de
 * détail, sans reprendre le cadrage ni l'effacement de décor de la précédente.
 */
export function newDraftSettings(): LineArtSettings {
  const { detail, stroke } = useAppStore.getState().lastSettings;
  return { detail, stroke };
}

export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}
