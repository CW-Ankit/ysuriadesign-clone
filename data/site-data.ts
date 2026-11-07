export interface ProjectMedia {
  type: "image" | "video";
  src: string;
  thumb?: string;
  label?: string;
  sound?: boolean;
}

export interface Project {
  id: string;
  name: string;
  tag: string;
  color: string;
  desc: string;
  cover: ProjectMedia;
  media: ProjectMedia[];
}

export interface Chapter {
  id: string;
  title: string;
  line: string;
  stats?: [string, string][];
  quiet?: boolean;
}

export const CHAPTERS: Chapter[] = [
  {
    id: "origin",
    title: "One person",
    line: "Design engineer and marketing motion designer. Brand, product, motion and code — I do all of it.",
  },
  {
    id: "memory",
    title: "Design as we know it is dead",
    line: "",
  },
  {
    id: "refraction",
    title: "A new frame of mind",
    line: "Every discipline, one frame.",
  },
  {
    id: "work",
    title: "The work",
    line: "Staking, restaking, oracles, cross-chain. P2P.org, Kelp DAO, RedStone, LI.FI.",
  },
  {
    id: "threshold",
    title: "Shipped",
    line: "Products, campaigns and launch films that grew the numbers. And sites like this one.",
    stats: [
      ["$6B → $10B", "TVL at P2P.org while I ran brand and product"],
      ["$990M → $2B", "TVL at Kelp DAO"],
    ],
  },
  {
    id: "network",
    title: "What’s next",
    line: "Bring the idea. I’ll take it all the way to launch.",
    stats: [
      ["130+", "institutional clients designed for"],
      ["40+", "networks shipped across"],
    ],
  },
];

export const PROJECTS: Project[] = [
  {
    id: "p2p",
    name: "P2P.org",
    tag: "Brand · Product · Marketing",
    color: "#3b7bff",
    desc: "Brand, product and marketing for the world’s largest non-custodial staking provider. Joined at $6B TVL, left at $10B — decks, one-pagers and campaigns across 40+ networks and 130+ institutional clients.",
    cover: {
      type: "image",
      src: "/assets/projects/1-p2p/cover.webp",
    },
    media: [
      {
        type: "image",
        src: "/assets/projects/1-p2p/cover.webp",
      },
      {
        type: "video",
        src: "/assets/projects/1-p2p/3.webm",
      },
      {
        type: "image",
        src: "/assets/projects/1-p2p/2.webp",
      },
      {
        type: "image",
        src: "/assets/projects/1-p2p/4.webp",
      },
    ],
  },
  {
    id: "kelp",
    name: "Kelp DAO",
    tag: "Brand · Product · Restaking",
    color: "#3fe0c0",
    desc: "Brand and product design for liquid restaking. Joined at $990M TVL, grew to $2B — product UX, landing page, KUSD stablecoin, Gain Vaults and the BD collateral that took rsETH onto Aave, Morpho, Pendle and SparkLend.",
    cover: {
      type: "image",
      src: "/assets/projects/3-kelp/cover.webp",
    },
    media: [
      {
        type: "image",
        src: "/assets/projects/3-kelp/cover.webp",
      },
      {
        type: "video",
        src: "/assets/projects/3-kelp/4.webm",
      },
      {
        type: "image",
        src: "/assets/projects/3-kelp/2.webp",
      },
      {
        type: "image",
        src: "/assets/projects/3-kelp/3.webp",
      },
    ],
  },
  {
    id: "redstone",
    name: "RedStone",
    tag: "Brand · Social · Motion",
    color: "#ff2a48",
    desc: "End-to-end brand, social and motion design for a modular oracle network — campaign visuals, a tight social system and launch videos across the funnel.",
    cover: {
      type: "video",
      src: "/assets/projects/2-redstone/cover.webm",
    },
    media: [
      {
        type: "video",
        src: "/assets/projects/2-redstone/cover.webm",
      },
      {
        type: "video",
        src: "/assets/hero-reels/brand/redstone_2.webm",
      },
      {
        type: "video",
        src: "/assets/projects/2-redstone/3.webm",
      },
      {
        type: "video",
        src: "/assets/projects/2-redstone/4.webm",
      },
      {
        type: "image",
        src: "/assets/projects/2-redstone/2.webp",
      },
    ],
  },
  {
    id: "jumper",
    name: "LI.FI · Jumper",
    tag: "Launch films · Motion",
    color: "#b35cff",
    desc: "Launch films for Jumper, the cross-chain exchange by LI.FI — Jumper Advanced v2 and Base Season.",
    cover: {
      type: "video",
      src: "/media/jumper/advanced-v2-loop.mp4",
    },
    media: [
      {
        type: "video",
        src: "/media/jumper/advanced-v2.mp4",
        thumb: "/media/jumper/advanced-v2-loop.mp4",
        label: "Jumper Advanced v2",
        sound: true,
      },
      {
        type: "video",
        src: "/media/jumper/base.mp4",
        thumb: "/media/jumper/base-loop.mp4",
        label: "Base Season",
        sound: true,
      },
    ],
  },
];
