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

