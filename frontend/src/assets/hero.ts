export type HeroSlide = {
  id: number;
  desktop: string;
  mobile: string;
  alt: string;
  heading?: string;
  ctas?: { label: string; href: string; external?: boolean }[];
};

const desktopModules = import.meta.glob<{ default: string }>("./desktopHero/*.jpg", {
  eager: true,
});

const phoneModules = import.meta.glob<{ default: string }>("./phoneHero/*.jpg", {
  eager: true,
});

function sortByNumber(pathA: string, pathB: string) {
  const numA = Number.parseInt(pathA.match(/(\d+)\.jpg$/)?.[1] ?? "0", 10);
  const numB = Number.parseInt(pathB.match(/(\d+)\.jpg$/)?.[1] ?? "0", 10);
  return numA - numB;
}

function loadImages(modules: Record<string, { default: string }>) {
  return Object.entries(modules)
    .sort(([a], [b]) => sortByNumber(a, b))
    .map(([path, mod]) => {
      const id = path.match(/(\d+)\.jpg$/)?.[1] ?? path;
      return { id, src: mod.default };
    });
}

const desktopImages = loadImages(desktopModules);
const phoneImages = loadImages(phoneModules);
const slideCount = Math.min(desktopImages.length, phoneImages.length);

export const heroSlides: HeroSlide[] = Array.from({ length: slideCount }, (_, index) => {
  const desktop = desktopImages[index]!;
  const mobile = phoneImages[index]!;

  return {
    id: index,
    desktop: desktop.src,
    mobile: mobile.src,
    alt: `Wole Emmanuel — hero ${desktop.id}`,
    ctas:
      index === 0
        ? [{ label: "Latest Music", href: "#latest-music" }]
        : index === 1
          ? [{ label: "Latest Videos", href: "#latest-videos" }]
          : [{ label: "View Gallery", href: "/gallery" }],
  };
});
