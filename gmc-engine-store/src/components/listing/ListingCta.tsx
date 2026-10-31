"use client";

import Link from "next/link";
import { useQuoteModal } from "../quote/QuoteModal";
import Icon from "../Icon";
import type { ListingPageData } from "@/lib/listing";

type Data = NonNullable<ListingPageData["cta"]>;

/** Closing strip from the listing markdown: the CTA line, a buy button and the back-link. */
export default function ListingCta({ data }: { data: Data }) {
  const { open } = useQuoteModal();
  return (
    <section className="bg-[#f7f9fc] dark:bg-[#0a1120] py-6 lg:py-7">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-line bg-white p-5 shadow-card dark:border-white/10 dark:bg-white/[0.03] lg:flex-row lg:items-center lg:p-6">
          <div className="min-w-0">
            <p className="text-[14.5px] leading-relaxed text-ink-800 dark:text-white/85">{data.line}</p>
            <Link href={data.crossHref} className="mt-2 inline-flex items-center gap-2 text-[13.5px] font-medium text-primary-600 hover:underline dark:text-primary-400">
              {data.crossLink}
            </Link>
          </div>
          <button type="button" onClick={() => open({ heading: "Order this engine", note: `Enquiry about: ${document.title}` })} className="inline-flex h-[46px] shrink-0 items-center justify-center gap-2.5 rounded-xl bg-primary-600 px-6 text-[15px] font-bold text-white transition-colors hover:bg-primary-500">
            <Icon name="shopping-cart" className="h-5 w-5" />
            {data.buyButton}
          </button>
        </div>
      </div>
    </section>
  );
}
