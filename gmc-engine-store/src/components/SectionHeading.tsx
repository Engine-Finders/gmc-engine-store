import Link from "next/link";
import Icon from "./Icon";

export default function SectionHeading({
  title,
  description,
  linkText,
  linkHref,
}: {
  title: string;
  description?: string;
  linkText?: string;
  linkHref?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight text-ink-900">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-ink-500 max-w-2xl">{description}</p>}
      </div>
      {linkText && linkHref && (
        <Link href={linkHref} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap">
          {linkText}
          <Icon name="arrow-right" className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
