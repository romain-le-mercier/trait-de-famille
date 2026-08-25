import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Mentions légales</h1>

      <h2>Éditeur du site</h2>
      <ul>
        <li>Raison sociale : [à compléter]</li>
        <li>Forme juridique et capital : [à compléter]</li>
        <li>Siège social : [à compléter]</li>
        <li>SIREN / RCS : [à compléter]</li>
        <li>N° TVA intracommunautaire : [à compléter]</li>
        <li>Responsable de la publication : [à compléter]</li>
        <li>Contact : [à compléter]</li>
      </ul>

      <h2>Hébergement</h2>
      <p>[à compléter : nom et adresse de l&apos;hébergeur.]</p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, illustrations et éléments d&apos;interface de ce site sont
        protégés. Les coloriages générés depuis tes photos t&apos;appartiennent :
        tu peux les imprimer et les diffuser librement dans un cadre privé.
      </p>

      <h2>Photos que tu envoies</h2>
      <p>
        Tu déclares disposer des droits sur les photos que tu transformes, et de
        l&apos;autorisation des personnes qui y figurent.
      </p>
    </>
  );
}
