import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { safeGet, mediaUrl, SchoolProfile } from "@/lib/api";
import { absoluteSiteUrl, schoolGeo, SITE_NAME, OG_IMAGE } from "@/lib/site";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const school = absoluteSiteUrl() ? await safeGet<SchoolProfile>("/school/") : null;
  const geo = schoolGeo(school);
  const logo = mediaUrl(school?.logo);
  const sameAs = [school?.telegram, school?.instagram, school?.facebook, school?.youtube].filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col">
      {absoluteSiteUrl() && <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "School",
        name: school?.name || SITE_NAME,
        alternateName: ["51-maktab", "Muzrabot tumani 51-sonli maktab"],
        description: "Surxondaryo viloyati Muzrabot tumani 51-sonli umumiy o'rta ta'lim maktabi.",
        url: absoluteSiteUrl(),
        image: absoluteSiteUrl(OG_IMAGE),
        ...(logo ? { logo } : {}),
        ...(school?.phone ? { telephone: school.phone } : {}),
        ...(school?.email ? { email: school.email } : {}),
        address: {
          "@type": "PostalAddress",
          ...(school?.address ? { streetAddress: school.address } : {}),
          addressLocality: "Muzrabot tumani",
          addressRegion: "Surxondaryo viloyati",
          addressCountry: "UZ",
        },
        ...(geo.lat != null ? { geo: { "@type": "GeoCoordinates", latitude: geo.lat, longitude: geo.lng } } : {}),
        hasMap: geo.linkUrl,
        ...(sameAs.length ? { sameAs } : {}),
      }} />}
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
