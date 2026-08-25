/**
 * Illustrations « avant / après » dessinées en SVG.
 *
 * La même géométrie sert aux deux rendus :
 *  - mode `photo`   : aplats de tons chair / cheveux / vêtements + flou léger,
 *                     ce qui donne la lecture « photo » à petite taille ;
 *  - mode `lineart` : papier blanc + trait d'encre, avec des zones de couleur
 *                     « crayon » qui se remplissent (le motif signature du brief).
 *
 * Aucune image distante : tout est vectoriel, donc net à toutes les tailles
 * et sans requête réseau.
 */

type HairStyle = "long" | "short" | "bun" | "tuft" | "none";

interface FigureSpec {
  kind: "figure";
  cx: number;
  cy: number;
  r: number;
  hair: HairStyle;
  skin: string;
  hairTone: string;
  shirtTone: string;
  crayonHair: string;
  crayonShirt: string;
  glasses?: boolean;
  brows?: boolean;
}

interface DogSpec {
  kind: "dog";
  cx: number;
  cy: number;
  r: number;
  furTone: string;
  crayonFur: string;
}

type Actor = FigureSpec | DogSpec;

const n = (value: number) => Math.round(value * 10) / 10;

/* ------------------------------------------------------------------ tracés */

function shouldersPath(f: { cx: number; cy: number; r: number }, closed: boolean) {
  const { cx, cy, r } = f;
  const sy = cy + r * 0.92;
  const half = r * 1.62;
  const bottom = sy + r * 1.7;
  const d =
    `M ${n(cx - half)} ${n(bottom)} ` +
    `C ${n(cx - half + r * 0.06)} ${n(sy + r * 0.5)}, ${n(cx - r * 0.72)} ${n(sy)}, ${n(cx)} ${n(sy)} ` +
    `C ${n(cx + r * 0.72)} ${n(sy)}, ${n(cx + half - r * 0.06)} ${n(sy + r * 0.5)}, ${n(cx + half)} ${n(bottom)}`;
  return closed ? `${d} L ${n(cx - half)} ${n(bottom)} Z` : d;
}

/** Bandeau de cheveux : courbe extérieure au-dessus du crâne, retour intérieur. */
function crescent(
  cx: number,
  cy: number,
  r: number,
  outerTop: number,
  innerTop: number,
  spread = 1.06,
) {
  const anchorY = cy + r * 0.42;
  return (
    `M ${n(cx - r * spread)} ${n(anchorY)} ` +
    `C ${n(cx - r * (spread + 0.1))} ${n(cy - r * outerTop)}, ${n(cx + r * (spread + 0.1))} ${n(cy - r * outerTop)}, ${n(cx + r * spread)} ${n(anchorY)} ` +
    `C ${n(cx + r * 0.9)} ${n(cy - r * (innerTop * 0.25))}, ${n(cx + r * 0.6)} ${n(cy - r * innerTop)}, ${n(cx)} ${n(cy - r * innerTop)} ` +
    `C ${n(cx - r * 0.6)} ${n(cy - r * innerTop)}, ${n(cx - r * 0.9)} ${n(cy - r * (innerTop * 0.25))}, ${n(cx - r * spread)} ${n(anchorY)} Z`
  );
}

function strandPath(cx: number, cy: number, r: number, side: 1 | -1) {
  const s = side;
  return (
    `M ${n(cx + s * r * 1.02)} ${n(cy + r * 0.3)} ` +
    `C ${n(cx + s * r * 1.28)} ${n(cy + r * 1.0)}, ${n(cx + s * r * 1.12)} ${n(cy + r * 1.5)}, ${n(cx + s * r * 0.72)} ${n(cy + r * 1.62)} ` +
    `C ${n(cx + s * r * 0.86)} ${n(cy + r * 1.1)}, ${n(cx + s * r * 0.92)} ${n(cy + r * 0.7)}, ${n(cx + s * r * 0.84)} ${n(cy + r * 0.28)} Z`
  );
}

function tuftPath(cx: number, cy: number, r: number) {
  return (
    `M ${n(cx - r * 0.12)} ${n(cy - r * 0.97)} ` +
    `C ${n(cx + r * 0.04)} ${n(cy - r * 1.52)}, ${n(cx + r * 0.62)} ${n(cy - r * 1.46)}, ${n(cx + r * 0.5)} ${n(cy - r * 0.98)} ` +
    `C ${n(cx + r * 0.42)} ${n(cy - r * 1.2)}, ${n(cx + r * 0.14)} ${n(cy - r * 1.24)}, ${n(cx + r * 0.1)} ${n(cy - r * 0.92)} Z`
  );
}

function hairShapes(f: FigureSpec): string[] {
  const { cx, cy, r, hair } = f;
  switch (hair) {
    case "long":
      return [
        crescent(cx, cy, r, 1.3, 0.66),
        strandPath(cx, cy, r, -1),
        strandPath(cx, cy, r, 1),
      ];
    case "short":
      return [crescent(cx, cy, r, 1.12, 0.76)];
    case "bun":
      return [crescent(cx, cy, r, 1.1, 0.74)];
    case "tuft":
      return [tuftPath(cx, cy, r)];
    case "none":
      return [];
  }
}

function smilePath(cx: number, cy: number, r: number) {
  return `M ${n(cx - r * 0.3)} ${n(cy + r * 0.34)} Q ${n(cx)} ${n(cy + r * 0.66)} ${n(cx + r * 0.3)} ${n(cy + r * 0.34)}`;
}

function browPath(cx: number, cy: number, r: number, side: 1 | -1) {
  const ex = cx + side * r * 0.33;
  return `M ${n(ex - r * 0.13)} ${n(cy - r * 0.3)} Q ${n(ex)} ${n(cy - r * 0.42)} ${n(ex + r * 0.13)} ${n(cy - r * 0.3)}`;
}

/* ------------------------------------------------------- rendu d'un acteur */

const INK = "#201b2e";

function FigureLine({ f, index }: { f: FigureSpec; index: number }) {
  const { cx, cy, r } = f;
  const eyeY = cy - r * 0.04;
  const eyeR = r * 0.085;
  const delay = (base: number) => ({ animationDelay: `${index * 0.18 + base}s` });

  return (
    <g>
      {/* papier : base blanche pour que la figure de devant masque celle de derrière */}
      <path d={shouldersPath(f, true)} fill="#fff" />
      <path
        d={shouldersPath(f, true)}
        fill={f.crayonShirt}
        opacity="0.85"
        className="fill-zone"
        style={delay(0.25)}
        transform={`translate(${index % 2 ? -2 : 2.5} 2)`}
      />
      <circle cx={cx} cy={cy} r={r} fill="#fff" />
      <circle
        cx={cx + 1.5}
        cy={cy + 1.5}
        r={r * 0.96}
        fill="#ffe3cf"
        opacity="0.75"
        className="fill-zone"
        style={delay(0.05)}
      />
      {hairShapes(f).map((d, i) => (
        <g key={`hair-${i}`}>
          <path d={d} fill="#fff" />
          <path
            d={d}
            fill={f.crayonHair}
            opacity="0.85"
            className="fill-zone"
            style={delay(0.12 + i * 0.05)}
            transform="translate(-2 -2)"
          />
        </g>
      ))}
      {f.hair === "bun" && (
        <>
          <circle cx={cx} cy={cy - r * 1.22} r={r * 0.34} fill="#fff" />
          <circle
            cx={cx - 1.5}
            cy={cy - r * 1.22 - 1.5}
            r={r * 0.32}
            fill={f.crayonHair}
            opacity="0.85"
            className="fill-zone"
            style={delay(0.2)}
          />
        </>
      )}

      {/* joues */}
      <circle
        cx={cx - r * 0.56}
        cy={cy + r * 0.22}
        r={r * 0.17}
        fill="#ff4b5c"
        opacity="0.35"
        className="fill-zone"
        style={delay(0.4)}
      />
      <circle
        cx={cx + r * 0.56}
        cy={cy + r * 0.22}
        r={r * 0.17}
        fill="#ff4b5c"
        opacity="0.35"
        className="fill-zone"
        style={delay(0.45)}
      />

      {/* le trait */}
      <g
        fill="none"
        stroke={INK}
        strokeWidth={Math.max(2.2, r * 0.075)}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={shouldersPath(f, false)} />
        <circle cx={cx} cy={cy} r={r} />
        {hairShapes(f).map((d, i) => (
          <path key={`hairline-${i}`} d={d} />
        ))}
        {f.hair === "bun" && <circle cx={cx} cy={cy - r * 1.22} r={r * 0.34} />}
        {f.brows && (
          <>
            <path d={browPath(cx, cy, r, -1)} />
            <path d={browPath(cx, cy, r, 1)} />
          </>
        )}
        <path d={smilePath(cx, cy, r)} />
        {f.glasses && (
          <>
            <circle cx={cx - r * 0.34} cy={eyeY} r={r * 0.26} />
            <circle cx={cx + r * 0.34} cy={eyeY} r={r * 0.26} />
            <path
              d={`M ${n(cx - r * 0.08)} ${n(eyeY)} L ${n(cx + r * 0.08)} ${n(eyeY)}`}
            />
          </>
        )}
      </g>
      <circle cx={cx - r * 0.34} cy={eyeY} r={eyeR} fill={INK} />
      <circle cx={cx + r * 0.34} cy={eyeY} r={eyeR} fill={INK} />
    </g>
  );
}

function FigurePhoto({ f }: { f: FigureSpec }) {
  const { cx, cy, r } = f;
  const eyeY = cy - r * 0.04;
  return (
    <g>
      <path d={shouldersPath(f, true)} fill={f.shirtTone} />
      {hairShapes(f).map((d, i) => (
        <path key={`hp-${i}`} d={d} fill={f.hairTone} />
      ))}
      {f.hair === "bun" && (
        <circle cx={cx} cy={cy - r * 1.22} r={r * 0.34} fill={f.hairTone} />
      )}
      <circle cx={cx} cy={cy} r={r} fill={f.skin} />
      {hairShapes(f).map((d, i) => (
        <path key={`hpf-${i}`} d={d} fill={f.hairTone} />
      ))}
      <circle
        cx={cx - r * 0.56}
        cy={cy + r * 0.24}
        r={r * 0.2}
        fill="#e8896f"
        opacity="0.4"
      />
      <circle
        cx={cx + r * 0.56}
        cy={cy + r * 0.24}
        r={r * 0.2}
        fill="#e8896f"
        opacity="0.4"
      />
      <ellipse
        cx={cx - r * 0.34}
        cy={eyeY}
        rx={r * 0.11}
        ry={r * 0.09}
        fill="#3b2f2a"
      />
      <ellipse
        cx={cx + r * 0.34}
        cy={eyeY}
        rx={r * 0.11}
        ry={r * 0.09}
        fill="#3b2f2a"
      />
      <path
        d={smilePath(cx, cy, r)}
        fill="none"
        stroke="#a8574c"
        strokeWidth={r * 0.09}
        strokeLinecap="round"
      />
    </g>
  );
}

function dogPaths(d: DogSpec) {
  const { cx, cy, r } = d;
  return {
    earLeft: `M ${n(cx - r * 0.82)} ${n(cy - r * 0.52)} C ${n(cx - r * 1.5)} ${n(cy - r * 0.95)}, ${n(cx - r * 1.55)} ${n(cy + r * 0.35)}, ${n(cx - r * 0.78)} ${n(cy + r * 0.48)} Z`,
    earRight: `M ${n(cx + r * 0.82)} ${n(cy - r * 0.52)} C ${n(cx + r * 1.5)} ${n(cy - r * 0.95)}, ${n(cx + r * 1.55)} ${n(cy + r * 0.35)}, ${n(cx + r * 0.78)} ${n(cy + r * 0.48)} Z`,
    mouth: `M ${n(cx)} ${n(cy + r * 0.52)} L ${n(cx)} ${n(cy + r * 0.68)} M ${n(cx - r * 0.22)} ${n(cy + r * 0.78)} Q ${n(cx)} ${n(cy + r * 0.62)} ${n(cx + r * 0.22)} ${n(cy + r * 0.78)}`,
  };
}

function DogLine({ d, index }: { d: DogSpec; index: number }) {
  const { cx, cy, r } = d;
  const p = dogPaths(d);
  const delay = (base: number) => ({ animationDelay: `${index * 0.18 + base}s` });
  return (
    <g>
      <path d={p.earLeft} fill="#fff" />
      <path d={p.earRight} fill="#fff" />
      <circle cx={cx} cy={cy} r={r} fill="#fff" />
      <path
        d={p.earLeft}
        fill={d.crayonFur}
        opacity="0.8"
        className="fill-zone"
        style={delay(0.3)}
      />
      <path
        d={p.earRight}
        fill={d.crayonFur}
        opacity="0.8"
        className="fill-zone"
        style={delay(0.34)}
      />
      <circle
        cx={cx + 1.5}
        cy={cy + 1.5}
        r={r * 0.95}
        fill={d.crayonFur}
        opacity="0.5"
        className="fill-zone"
        style={delay(0.38)}
      />
      <ellipse cx={cx} cy={cy + r * 0.42} rx={r * 0.52} ry={r * 0.38} fill="#fff" />
      <g
        fill="none"
        stroke={INK}
        strokeWidth={Math.max(2.2, r * 0.1)}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={p.earLeft} />
        <path d={p.earRight} />
        <circle cx={cx} cy={cy} r={r} />
        <ellipse cx={cx} cy={cy + r * 0.42} rx={r * 0.52} ry={r * 0.38} />
        <path d={p.mouth} />
      </g>
      <ellipse
        cx={cx}
        cy={cy + r * 0.22}
        rx={r * 0.18}
        ry={r * 0.13}
        fill={INK}
      />
      <circle cx={cx - r * 0.38} cy={cy - r * 0.2} r={r * 0.11} fill={INK} />
      <circle cx={cx + r * 0.38} cy={cy - r * 0.2} r={r * 0.11} fill={INK} />
    </g>
  );
}

function DogPhoto({ d }: { d: DogSpec }) {
  const { cx, cy, r } = d;
  const p = dogPaths(d);
  return (
    <g>
      <path d={p.earLeft} fill={d.furTone} />
      <path d={p.earRight} fill={d.furTone} />
      <circle cx={cx} cy={cy} r={r} fill={d.furTone} />
      <ellipse
        cx={cx}
        cy={cy + r * 0.42}
        rx={r * 0.52}
        ry={r * 0.38}
        fill="#f3e2cd"
      />
      <ellipse cx={cx} cy={cy + r * 0.22} rx={r * 0.18} ry={r * 0.13} fill="#2c2320" />
      <circle cx={cx - r * 0.38} cy={cy - r * 0.2} r={r * 0.12} fill="#2c2320" />
      <circle cx={cx + r * 0.38} cy={cy - r * 0.2} r={r * 0.12} fill="#2c2320" />
    </g>
  );
}

/* ------------------------------------------------------------------ scènes */

const SKIN = ["#f2cba9", "#e3ab83", "#f7d9bd", "#d69b74"];

export const SCENES = {
  famille: [
    {
      kind: "figure",
      cx: 118,
      cy: 162,
      r: 46,
      hair: "long",
      skin: SKIN[0],
      hairTone: "#8a5a33",
      shirtTone: "#5b7fb9",
      crayonHair: "#ffd23f",
      crayonShirt: "#ff5fa2",
      brows: true,
    },
    {
      kind: "figure",
      cx: 282,
      cy: 148,
      r: 44,
      hair: "short",
      skin: SKIN[1],
      hairTone: "#33291f",
      shirtTone: "#7c9a6d",
      crayonHair: "#3aa0ff",
      crayonShirt: "#34c77b",
      brows: true,
    },
    {
      kind: "dog",
      cx: 92,
      cy: 328,
      r: 30,
      furTone: "#c99a63",
      crayonFur: "#ff9f1c",
    },
    {
      kind: "figure",
      cx: 200,
      cy: 250,
      r: 36,
      hair: "tuft",
      skin: SKIN[2],
      hairTone: "#a9713c",
      shirtTone: "#d9b45b",
      crayonHair: "#ff4b5c",
      crayonShirt: "#3aa0ff",
    },
  ] as Actor[],
  grandsParents: [
    {
      kind: "figure",
      cx: 140,
      cy: 182,
      r: 52,
      hair: "bun",
      skin: SKIN[2],
      hairTone: "#b9b3ae",
      shirtTone: "#b07f9c",
      crayonHair: "#3aa0ff",
      crayonShirt: "#ffd23f",
      brows: true,
    },
    {
      kind: "figure",
      cx: 272,
      cy: 196,
      r: 50,
      hair: "none",
      skin: SKIN[3],
      hairTone: "#b9b3ae",
      shirtTone: "#6f88a8",
      crayonHair: "#b9b3ae",
      crayonShirt: "#34c77b",
      glasses: true,
      brows: true,
    },
  ] as Actor[],
  enfantChien: [
    {
      kind: "figure",
      cx: 150,
      cy: 168,
      r: 54,
      hair: "tuft",
      skin: SKIN[0],
      hairTone: "#c98f45",
      shirtTone: "#c2564f",
      crayonHair: "#ffd23f",
      crayonShirt: "#ff4b5c",
    },
    {
      kind: "dog",
      cx: 276,
      cy: 248,
      r: 58,
      furTone: "#8f7a68",
      crayonFur: "#ff9f1c",
    },
  ] as Actor[],
} satisfies Record<string, Actor[]>;

export type SceneName = keyof typeof SCENES;

/* --------------------------------------------------------------- gribouillis */

export function Sparkle({
  x,
  y,
  size = 16,
  color = "#ff9f1c",
  className,
}: {
  x: number;
  y: number;
  size?: number;
  color?: string;
  className?: string;
}) {
  const s = size / 10;
  return (
    <path
      className={className}
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M 0 -10 C 1.6 -3.2, 3.2 -1.6, 10 0 C 3.2 1.6, 1.6 3.2, 0 10 C -1.6 3.2, -3.2 1.6, -10 0 C -3.2 -1.6, -1.6 -3.2, 0 -10 Z"
      fill={color}
    />
  );
}

export function SunDoodle({
  x,
  y,
  size = 40,
  color = "#201b2e",
}: {
  x: number;
  y: number;
  size?: number;
  color?: string;
}) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4;
    const r1 = size * 0.42;
    const r2 = size * 0.62;
    return `M ${n(Math.cos(angle) * r1)} ${n(Math.sin(angle) * r1)} L ${n(Math.cos(angle) * r2)} ${n(Math.sin(angle) * r2)}`;
  }).join(" ");
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <circle r={size * 0.3} />
      <path d={rays} />
    </g>
  );
}

/* ------------------------------------------------------------------- scène */

interface SceneProps {
  scene?: SceneName;
  mode: "photo" | "lineart";
  /** Déclenche le remplissage couleur (mode lineart). */
  filled?: boolean;
  className?: string;
  doodles?: boolean;
}

export function Scene({
  scene = "famille",
  mode,
  filled = false,
  className,
  doodles = true,
}: SceneProps) {
  const actors = SCENES[scene];

  if (mode === "photo") {
    return (
      <svg
        viewBox="0 0 400 400"
        className={className}
        role="img"
        aria-label="Photo de famille (illustration)"
      >
        <defs>
          <linearGradient id={`sky-${scene}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dfe9f5" />
            <stop offset="60%" stopColor="#f0e4d4" />
            <stop offset="100%" stopColor="#e3d3c0" />
          </linearGradient>
          <filter id={`soft-${scene}`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <radialGradient id={`vig-${scene}`} cx="50%" cy="45%" r="70%">
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(40,30,20,0.28)" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill={`url(#sky-${scene})`} />
        <g filter={`url(#soft-${scene})`}>
          {actors.map((actor, i) =>
            actor.kind === "figure" ? (
              <FigurePhoto key={i} f={actor} />
            ) : (
              <DogPhoto key={i} d={actor} />
            ),
          )}
        </g>
        <rect width="400" height="400" fill={`url(#vig-${scene})`} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      data-filled={filled ? "true" : "false"}
      role="img"
      aria-label="Le même moment, version dessin au trait à colorier"
    >
      <rect width="400" height="400" fill="#ffffff" />
      {doodles && (
        <g>
          <SunDoodle x={352} y={52} size={46} color="#c9c2e0" />
          <Sparkle
            x={40}
            y={62}
            size={18}
            color="#ffd23f"
            className="fill-zone"
          />
          <Sparkle
            x={362}
            y={318}
            size={14}
            color="#ff5fa2"
            className="fill-zone"
          />
        </g>
      )}
      {actors.map((actor, i) =>
        actor.kind === "figure" ? (
          <FigureLine key={i} f={actor} index={i} />
        ) : (
          <DogLine key={i} d={actor} index={i} />
        ),
      )}
    </svg>
  );
}
