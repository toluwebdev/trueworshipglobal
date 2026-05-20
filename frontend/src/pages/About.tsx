import type { CSSProperties, ReactNode } from "react";
import founderImage from "../assets/56.jpg";
import ministryImage from "../assets/45.jpg";
import {
  bioParagraphs,
  corePillars,
  ministryParagraphs,
  ministryScripture,
} from "../assets/about";
import InViewSection from "../components/InViewSection";
import { InViewItem, InViewStagger } from "../components/InViewStagger";

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
      <InViewSection
        as="div"
        className="rounded-sm border border-white/10 bg-background/45 px-6 py-10 backdrop-blur-lg md:px-10 md:py-12"
      >
        <InViewStagger className="space-y-8">{children}</InViewStagger>
      </InViewSection>
    </div>
  </section>
);

const About = () => (
  <div className="bg-background text-white">
    <FixedBgSection image={ministryImage}>
      <InViewItem>
        <h1 className="font-primary text-sm tracking-[0.35em] uppercase md:text-base">
          True Worship Global
        </h1>
      </InViewItem>

      {ministryParagraphs.map((paragraph) => (
        <InViewItem key={paragraph.slice(0, 40)}>
          <p className="font-lato text-base leading-relaxed text-white/90 md:text-lg md:leading-[1.85]">
            {paragraph}
          </p>
        </InViewItem>
      ))}

      <InViewItem>
        <blockquote className="border-l-2 border-gold/60 pl-6">
          <p className="font-lato text-base leading-relaxed text-white/85 italic md:text-lg md:leading-[1.85]">
            &ldquo;{ministryScripture.text}&rdquo;
          </p>
          <cite className="mt-4 block font-primary text-xs tracking-[0.2em] text-gold not-italic uppercase">
            {ministryScripture.reference}
          </cite>
        </blockquote>
      </InViewItem>

      <InViewItem>
        <h2 className="font-primary text-xs tracking-[0.3em] text-white/70 uppercase">
          Our Core Pillars
        </h2>
      </InViewItem>

      <ul className="space-y-8">
        {corePillars.map((pillar, i) => (
          <InViewItem key={pillar.title} as="li">
            <p className="font-primary text-sm tracking-[0.15em] text-gold uppercase">
              {i + 1}. {pillar.title}
            </p>
            <p className="mt-2 font-lato text-base leading-relaxed text-white/85 md:text-lg md:leading-[1.85]">
              {pillar.description}
            </p>
          </InViewItem>
        ))}
      </ul>
    </FixedBgSection>

    <FixedBgSection image={founderImage}>
      <InViewItem>
        <h2 className="font-primary text-sm tracking-[0.35em] uppercase md:text-base">
          About the Founder
        </h2>
      </InViewItem>

      {bioParagraphs.map((paragraph) => (
        <InViewItem key={paragraph.slice(0, 40)}>
          <p className="font-lato text-base leading-relaxed text-white/90 md:text-lg md:leading-[1.85]">
            {paragraph}
          </p>
        </InViewItem>
      ))}
    </FixedBgSection>
  </div>
);

export default About;
