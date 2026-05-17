export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
};

const modules = import.meta.glob<{ default: string }>("./*.jpg", {
  eager: true,
});

function sortByNumber(pathA: string, pathB: string) {
  const numA = Number.parseInt(pathA.match(/(\d+)\.jpg$/)?.[1] ?? "0", 10);
  const numB = Number.parseInt(pathB.match(/(\d+)\.jpg$/)?.[1] ?? "0", 10);
  return numA - numB;
}

export const galleryImages: GalleryImage[] = Object.entries(modules)
  .sort(([a], [b]) => sortByNumber(a, b))
  .map(([path, mod]) => {
    const id = path.replace("./", "").replace(".jpg", "");
    return {
      id,
      src: mod.default,
      alt: `Wole Emmanuel — photo ${id}`,
    };
  });

export type HeroSlide = {
  id: number;
  image: string;
  alt: string;
  heading?: string;
  ctas?: { label: string; href: string; external?: boolean }[];
};

export const heroSlides: HeroSlide[] = galleryImages.slice(0, 6).map((image, index) => ({
  id: Number(image.id),
  image: image.src,
  alt: image.alt,
  ctas:
    index === 0
      ? [{ label: "Latest Music", href: "#latest-music" }]
      : index === 1
        ? [{ label: "Latest Videos", href: "#latest-videos" }]
        : [{ label: "View Gallery", href: "/gallery" }],
}));
