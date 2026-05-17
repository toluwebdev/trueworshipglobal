import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { contact, initiatives, mailingListCopy } from "../assets/about";
import data from "../assets/data";
import { cmsApi } from "../lib/api";
import SocialIcon, { type IconName } from "./SocialIcon";

const Footer = () => {
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onNavClick = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();

    setSubmitting(true);
    setSubmitError(null);
    try {
      await cmsApi.mailing.subscribe(name, email);
      setSubmitted(true);
      form.reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not join the mailing list",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      id="footer"
      className=" bg-background px-6 pb-16 pt-16 md:px-10 md:pb-24 md:pt-20"
    >
      <motion.div
        className="mx-auto max-w-3xl text-center"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45 }}
      >
        <nav
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-14"
          aria-label="Ministry links"
        >
          {initiatives.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => onNavClick(item.href)}
              className="font-secondary text-lg tracking-[0.2em] text-white transition hover:text-white/70 md:text-xl"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mx-auto mt-16 max-w-lg md:mt-20">
          <p className="font-lato text-base leading-relaxed text-white/90 md:text-lg">
            {mailingListCopy.lead}
          </p>
          <p className="mt-4 font-lato text-base text-white/90 md:text-lg">
            {mailingListCopy.sub}
          </p>

          {submitted ? (
            <p className="mt-10 font-primary text-sm tracking-[0.25em] text-white uppercase">
              Thank you — you&apos;re on the list.
            </p>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mt-10 space-y-4 text-left"
              noValidate
            >
              <label className="block">
                <span className="sr-only">Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Name"
                  className="w-full border border-white/35 bg-transparent px-4 py-3 font-lato text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="Email"
                  className="w-full border border-white/35 bg-transparent px-4 py-3 font-lato text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                />
              </label>
              {submitError && (
                <p className="font-lato text-sm text-red-300">{submitError}</p>
              )}
              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-w-[140px] items-center justify-center border border-white/80 px-8 py-2.5 font-primary text-sm tracking-[0.3em] text-white uppercase transition hover:bg-white hover:text-black disabled:opacity-50"
                >
                  {submitting ? "Joining…" : "Join"}
                </button>
              </div>
            </form>
          )}
        </section>

        <div className="mt-16 pt-16 md:mt-20">
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="font-secondary text-2xl tracking-wide text-white transition hover:text-white/75 md:text-3xl"
          >
            {contact.phone}
          </a>
          <p className="mt-6 font-secondary text-xl tracking-[0.15em] text-white md:text-2xl">
            {contact.organization}
          </p>
          <a
            href={`mailto:${contact.email}`}
            className="mt-4 inline-block font-lato text-base text-white/80 underline-offset-4 transition hover:text-white hover:underline md:text-lg"
          >
            {contact.email}
          </a>

          <ul className="mt-12 flex flex-wrap items-center justify-center gap-5">
            {data.socialLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="text-white/80 transition hover:text-white"
                  aria-label={link.label}
                >
                  <SocialIcon name={link.name as IconName} className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
