import "./globals.css";
import Effects from "@/components/Effects";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Backlink Prospector: competitor backlinks to ready-to-pitch prospects",
  description:
    "Upload an Ahrefs or Semrush export. Get every relevant site with the best page to pitch, the reason it fits, the author and a verified email.",
  authors: [{ name: SITE.owner, url: SITE.website }],
  creator: SITE.owner,
  publisher: SITE.owner,
  openGraph: {
    title: "Backlink Prospector",
    description: "Turn a competitor's backlink export into an outreach list you can send today.",
    type: "website",
  },
};

export const viewport = { themeColor: "#0F1535", width: "device-width", initialScale: 1, viewportFit: "cover" };

// Marks the page as script-enabled before paint, so reveal animations never hide content for no-JS visitors.
const boot = `document.documentElement.classList.add('js')`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Public+Sans:wght@400;500;600;700&display=swap"
        />
        <link rel="author" href={SITE.website} />
      </head>
      <body>
        {children}
        <Effects />
      </body>
    </html>
  );
}
