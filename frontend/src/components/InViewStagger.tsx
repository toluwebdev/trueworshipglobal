import { motion, type HTMLMotionProps } from "framer-motion";
import type { ElementType } from "react";
import { staggerContainer, staggerItem, VIEWPORT } from "../lib/motion";

type InViewStaggerProps = HTMLMotionProps<"div">;

export const InViewStagger = ({ children, ...props }: InViewStaggerProps) => (
  <motion.div
    variants={staggerContainer}
    initial="hidden"
    whileInView="visible"
    viewport={VIEWPORT}
    {...props}
  >
    {children}
  </motion.div>
);

type InViewItemProps = HTMLMotionProps<"div"> & {
  as?: "div" | "li" | "article" | "p";
};

export const InViewItem = ({ as = "div", children, ...props }: InViewItemProps) => {
  const Component = motion[as] as ElementType;
  return (
    <Component variants={staggerItem} {...props}>
      {children}
    </Component>
  );
};
