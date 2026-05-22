type BlogRegisterCtaProps = {
  registerUrl: string;
  label?: string;
};

function externalLinkProps(url: string) {
  const isExternal = url.startsWith("http");
  return {
    target: isExternal ? ("_blank" as const) : undefined,
    rel: isExternal ? "noopener noreferrer" : undefined,
  };
}

const BlogRegisterCta = ({
  registerUrl,
  label = "Register",
}: BlogRegisterCtaProps) => {
  if (!registerUrl?.trim()) return null;

  return (
    <div className="mt-12 border-t border-white/15 pt-10">
      <a
        href={registerUrl}
        {...externalLinkProps(registerUrl)}
        className="inline-flex w-full items-center justify-center border border-gold bg-gold px-6 py-3.5 font-primary text-sm tracking-[0.25em] text-black uppercase transition hover:bg-gold-dark sm:w-auto"
      >
        {label}
      </a>
    </div>
  );
};

export default BlogRegisterCta;
