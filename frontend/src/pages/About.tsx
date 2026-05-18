import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import aboutImage from "../assets/45.jpg";
import ministryImage from "../assets/38.jpg";
import {
  bioParagraphs,
  corePillars,
  ministryParagraphs,
  ministryScripture,
} from "../assets/about";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

type FixedBgSectionProps = {
  image: string;
  children: ReactNode;
  className?: string;
};

const FixedBgSection = ({ image, children, className = "" }: FixedBgSectionProps) => (
  <section className={`relative min-h-screen ${className}`}>
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={
        {
          backgroundImage: `url(${image})`,
          backgroundAttachment: "fixed",
        } as CSSProperties
      }
      aria-hidden
    />
    <div className="absolute inset-0 bg-background/40" aria-hidden />
    <div className="relative z-10 mx-auto max-w-3xl px-6 py-28 md:px-10 md:py-32">
      <div className="rounded-sm border border-white/10 bg-background/45 px-6 py-10 backdrop-blur-lg md:px-10 md:py-12">
        {children}
      </div>
    </div>
  </section>
);

const About = () => {
  let motionIndex = 0;
  const nextIndex = () => motionIndex++;

  return (
    <motion.div
      className="bg-background text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Ministry — True Worship Global */}
      <FixedBgSection image={ministryImage}>
        <motion.h1
          custom={nextIndex()}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10 font-primary text-sm tracking-[0.35em] uppercase md:text-base"
        >
          True Worship Global
        </motion.h1>

        {ministryParagraphs.map((paragraph) => (
          <motion.p
            key={paragraph.slice(0, 40)}
            custom={nextIndex()}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8 font-lato text-base leading-relaxed text-white/90 md:text-lg md:leading-[1.85]"
          >
            {paragraph}
          </motion.p>
        ))}

        <motion.blockquote
          custom={nextIndex()}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="my-10 border-l-2 border-gold/60 pl-6"
        >
          <p className="font-lato text-base leading-relaxed text-white/85 italic md:text-lg md:leading-[1.85]">
            &ldquo;{ministryScripture.text}&rdquo;
          </p>
          <cite className="mt-4 block font-primary text-xs tracking-[0.2em] text-gold not-italic uppercase">
            {ministryScripture.reference}
          </cite>
        </motion.blockquote>

        <motion.h2
          custom={nextIndex()}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8 font-primary text-xs tracking-[0.3em] text-white/70 uppercase"
        >
          Our Core Pillars
        </motion.h2>

        <ul className="space-y-8">
          {corePillars.map((pillar, i) => (
            <motion.li
              key={pillar.title}
              custom={nextIndex()}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <p className="font-primary text-sm tracking-[0.15em] text-gold uppercase">
                {i + 1}. {pillar.title}
              </p>
              <p className="mt-2 font-lato text-base leading-relaxed text-white/85 md:text-lg md:leading-[1.85]">
                {pillar.description}
              </p>
            </motion.li>
          ))}
        </ul>
      </FixedBgSection>

      {/* Founder */}
      <FixedBgSection image={aboutImage}>
        <motion.h2
          custom={nextIndex()}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10 font-primary text-sm tracking-[0.35em] uppercase md:text-base"
        >
          About the Founder
        </motion.h2>

        {bioParagraphs.map((paragraph) => (
          <motion.p
            key={paragraph.slice(0, 40)}
            variants={fadeUp}
            custom={nextIndex()}
            initial="hidden"
            animate="visible"
            className="mb-8 font-lato text-base leading-relaxed text-white/90 md:text-lg md:leading-[1.85]"
          >
            {paragraph}
          </motion.p>
        ))}
      </FixedBgSection>
    </motion.div>
  );
};

export default About;
