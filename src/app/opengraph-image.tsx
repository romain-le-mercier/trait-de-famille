import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "Une photo de famille et le coloriage au trait obtenu à partir d'elle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Image de partage : la promesse du produit tient dans un avant/après, pas
 * dans un logo. On lit les deux visuels d'exemple sur le disque et on les
 * encode dans l'image — elle est produite au build, jamais à la volée.
 */
async function dataUri(file: string): Promise<string> {
  const bytes = await readFile(path.join(process.cwd(), "public", "exemples", file));
  return `data:image/jpeg;base64,${bytes.toString("base64")}`;
}

export default async function OpengraphImage() {
  const [photo, trait] = await Promise.all([
    dataUri("jardin-chien-photo.jpg"),
    dataUri("jardin-chien-trait.jpg"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fffdf7",
        }}
      >
        {/* Satori ne produit pas de HTML : `alt` n'a pas de sens ici, mais la
            règle d'accessibilité s'applique quand même au JSX. */}
        <div style={{ display: "flex", flex: 1 }}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img src={photo} width={600} height={470} style={{ objectFit: "cover" }} />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img src={trait} width={600} height={470} style={{ objectFit: "cover" }} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: 160,
            padding: "0 56px",
            backgroundColor: "#1b1b23",
            color: "#ffffff",
          }}
        >
          <div style={{ fontSize: 46, fontWeight: 700 }}>
            Trait de Famille
          </div>
          <div style={{ fontSize: 28, color: "#c9c6de", marginTop: 8 }}>
            Tes photos deviennent des coloriages à imprimer.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
