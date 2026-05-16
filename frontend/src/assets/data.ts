import logo from "./logo.png";

export const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Blog", path: "/blog" },
  { label: "Gallery", path: "/gallery" },
] as const;

export const socialLinks = [
  { name: "instagram", label: "Instagram", href: "#" },
  { name: "twitter", label: "Twitter", href: "#" },
  {
    name: "youtube",
    label: "Youtube",
    href: "https://www.youtube.com/@woleemmanuel/videos",
  },
  {
    name: "spotify",
    label: "Spotify",
    href: "https://open.spotify.com/artist/7wq2EoSyIrfTTE45GyfCC2",
  },
  { name: "apple", label: "Apple Music", href: "#" },
  { name: "facebook", label: "Facebook", href: "#" },
] as const;

export default {
  logo,
  navLinks,
  socialLinks,
};
