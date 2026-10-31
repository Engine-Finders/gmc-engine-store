import type { Metadata } from "next";
import "./globals.css";
import QuoteModalProvider from "@/components/quote/QuoteModal";

export const metadata: Metadata = {
  title: "Buy Used & Reconditioned Engines Online | GMC",
  description:
    "Buy used and reconditioned engines online at fixed prices. Find your engine by registration or browse by brand. Verified fitment, warranty, UK delivery.",
  metadataBase: new URL("https://example.com"),
  alternates: {
    canonical: "https://example.com/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-ink-900 antialiased">
        <QuoteModalProvider>{children}</QuoteModalProvider>
      </body>
    </html>
  );
}
