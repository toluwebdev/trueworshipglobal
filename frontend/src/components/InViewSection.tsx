import { motion, type HTMLMotionProps } from "framer-motion";
import type { ElementType } from "react";
import { fadeUp, VIEWPORT } from "../lib/motion";

type InViewSectionProps = HTMLMotionProps<"section"> & {
  as?: "section" | "div" | "article" | "header" | "footer" | "nav" | "p";
};

const InViewSection = ({ as = "section", ...props }: InViewSectionProps) => {
  const Component = motion[as] as ElementType;
  return (
    <Component
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      {...props}
    />
  );
};

export default InViewSection;
