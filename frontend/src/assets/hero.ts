import desktop09 from "./09.jpg";
import desktop02 from "./02.jpg";
import desktop11 from "./11.jpg";
import desktop32 from "./32.jpg";
import desktop47 from "./47.jpg";
import desktop53 from "./53.jpg";
import desktop05 from "./05.jpg";
import desktop15 from "./15.jpg";

import mobile09 from "./09.jpg";
import mobile03 from "./03.jpg";
import mobile11 from "./11.jpg";
import mobile38 from "./38.jpg";
import mobile50 from "./50.jpg";
import mobile71 from "./71.jpg";
import mobile17 from "./17.jpg";
import mobile34 from "./34.jpg";
import mobile66 from "./66.jpg";

export type HeroSlide = {
  id: number;
  desktop: string;
  mobile: string;
  alt: string;
  heading?: string;
  ctas?: { label: string; href: string; external?: boolean }[];
};

const desktopImages = [
  desktop09,
  desktop02,
  desktop11,
  desktop32,
  desktop47,
  desktop53,
  desktop05,
  desktop15,
  desktop32,
];

const mobileImages = [
  mobile09,
  mobile03,
  mobile11,
  mobile38,
  mobile50,
  mobile71,
  mobile17,
  mobile34,
  mobile66,
];

const desktopNumbers = ["09", "02", "11", "32", "47", "53", "05", "15", "32"];

export const heroSlides: HeroSlide[] = desktopImages.map((desktop, index) => ({
  id: index,
  desktop,
  mobile: mobileImages[index]!,
  alt: `Wole Emmanuel — hero ${desktopNumbers[index]}`,
  ctas:
    index === 0
      ? [{ label: "Latest Music", href: "#latest-music" }]
      : index === 1
        ? [{ label: "Latest Videos", href: "#latest-videos" }]
        : [{ label: "View Gallery", href: "/gallery" }],
}));
