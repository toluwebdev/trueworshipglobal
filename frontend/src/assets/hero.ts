export type HeroSlide = {
  id: number;
  desktop: string;
  mobile: string;
  alt: string;
  heading?: string;
  ctas?: { label: string; href: string; external?: boolean }[];
};

const assetModules = import.meta.glob<{ default: string }>(
  [
    "./02.jpg",
    "./03.jpg",
    "./09.jpg",
    "./11.jpg",
    "./15.jpg",
    "./17.jpg",
    "./32.jpg",
    "./34.jpg",
    "./38.jpg",
    "./47.jpg",
    "./50.jpg",
    "./53.jpg",
    "./66.jpg",
    "./71.jpg",
  ],
  { eager: true },
);

function assetImage(num: number): string {
  const file = `./${String(num).padStart(2, "0")}.jpg`;
  const mod = assetModules[file];
  if (!mod) {
    throw new Error(`Hero asset not found: ${file}`);
  }
  return mod.default;
}

/** Desktop home header — order as specified */
const DESKTOP_NUMBERS = [9, 2, 11, 32, 47, 53, 3, 15, 32] as const;

/** Mobile home header — order as specified */
const MOBILE_NUMBERS = [9, 3, 11, 38, 50, 71, 17, 34, 66] as const;

export const heroSlides: HeroSlide[] = DESKTOP_NUMBERS.map((desktopNum, index) => {
  const mobileNum = MOBILE_NUMBERS[index]!;

  return {
    id: index,
    desktop: assetImage(desktopNum),
    mobile: assetImage(mobileNum),
    alt: `Wole Emmanuel — hero ${String(desktopNum).padStart(2, "0")}`,
    ctas:
      index === 0
        ? [{ label: "Latest Music", href: "#latest-music" }]
        : index === 1
          ? [{ label: "Latest Videos", href: "#latest-videos" }]
          : [{ label: "View Gallery", href: "/gallery" }],
  };
});
