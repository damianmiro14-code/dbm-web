export default function SectionHeader({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="max-w-3xl">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight relative inline-block">
        {title}
        <span
          aria-hidden="true"
          className="block mt-3 h-[2px] w-16 rounded-full bg-gradient-to-r from-accent to-brand"
        />
      </h2>
      {subtitle ? <p className="mt-2 text-slate-700/90">{subtitle}</p> : null}
    </header>
  );
}
