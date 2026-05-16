import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import data from "../assets/data";
import SocialIcon, { type IconName } from "./SocialIcon";

const navItemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

const mobileMenuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.25 },
  },
};

const Nav = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === "/";
  const onHero = isHome && !scrolled;
  const isLight = !onHero;

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={false}
      animate={{
        backgroundColor: isLight ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0)",
        borderBottomColor: isLight ? "rgb(229,229,229)" : "rgba(229,229,229,0)",
      }}
      transition={{ duration: 0.3 }}
      style={{
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
        backdropFilter: isLight ? "blur(12px)" : "none",
      }}
    >
      <motion.div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:grid md:grid-cols-[1fr_auto_1fr] md:px-10 ${
          isLight ? "text-neutral-900" : "text-white"
        }`}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/" className="block shrink-0 justify-self-start">
            <img src={data.logo} className="h-10 w-auto md:h-12" alt="Logo" />
          </Link>
        </motion.div>

        <nav
          className="hidden justify-self-center md:block"
          aria-label="Main navigation"
        >
          <motion.ul
            className="flex items-center gap-8 font-primary text-sm tracking-wide"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {data.navLinks.map(({ label, path }, i) => (
              <motion.li key={path} variants={navItemVariants} custom={i}>
                <Link
                  to={path}
                  className="relative block py-1"
                >
                  {label}
                  {isActive(path) && (
                    <motion.span
                      layoutId="nav-underline"
                      className={`absolute inset-x-0 -bottom-0.5 h-px ${
                        isLight ? "bg-neutral-900" : "bg-white"
                      }`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </nav>

        <motion.div
          className="hidden items-center justify-end gap-4 justify-self-end md:flex"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04, delayChildren: 0.2 } } }}
        >
          {data.socialLinks.map(({ name, label, href }, i) => (
            <motion.a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              variants={navItemVariants}
              custom={i}
              whileHover={{ scale: 1.15, opacity: 0.7 }}
              whileTap={{ scale: 0.95 }}
            >
              <SocialIcon name={name as IconName} />
            </motion.a>
          ))}
        </motion.div>

        <motion.button
          type="button"
          className="flex h-10 w-10 items-center justify-center md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {menuOpen ? (
              <motion.svg
                key="close"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" />
              </motion.svg>
            ) : (
              <motion.svg
                key="menu"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <path d="M0 8.5H24" stroke="currentColor" strokeWidth="2" />
                <path d="M0 15.5H24" stroke="currentColor" strokeWidth="2" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="overflow-hidden border-t border-neutral-200 bg-white px-6 text-neutral-900 md:hidden"
            aria-label="Mobile navigation"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.ul
              className="flex flex-col gap-5 py-6 font-primary text-base"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {data.navLinks.map(({ label, path }, i) => (
                <motion.li key={path} variants={navItemVariants} custom={i}>
                  <Link
                    to={path}
                    className={isActive(path) ? "underline underline-offset-4" : ""}
                  >
                    {label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div
              className="flex flex-wrap gap-5 pb-6"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
            >
              {data.socialLinks.map(({ name, label, href }, i) => (
                <motion.a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  variants={navItemVariants}
                  custom={i}
                  whileTap={{ scale: 0.95 }}
                >
                  <SocialIcon name={name as IconName} className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Nav;
