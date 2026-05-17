import { motion } from "framer-motion";
import aboutImage from "../assets/45.jpg";
import { bioParagraphs } from "../assets/about";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const About = () => {
  return (
    <motion.div
      className="min-h-screen bg-background pb-24 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="min-h-screen bg-background bg-cover bg-center"
        style={{
          backgroundImage: `url(${aboutImage})`,
          backgroundAttachment: "fixed",
        }}
      />
      <article className="mx-auto max-w-3xl pt-10">
        {bioParagraphs.map((paragraph, i) => (
          <motion.p
            key={i}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8 font-lato text-base leading-relaxed text-white/90 md:text-lg md:leading-[1.85]"
          >
            {paragraph}
          </motion.p>
        ))}
      </article>
    </motion.div>
  );
};

export default About;
