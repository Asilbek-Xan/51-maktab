import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { absoluteSiteUrl } from "@/lib/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {absoluteSiteUrl() && <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: "51-sonli maktab",
        description: "Surxondaryo viloyati Muzrabot tumani 51-sonli umumiy o'rta ta'lim maktabi.",
        address: { "@type": "PostalAddress", addressLocality: "Muzrabot tumani", addressRegion: "Surxondaryo viloyati", addressCountry: "UZ" },
        url: absoluteSiteUrl(),
      }} />}
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
