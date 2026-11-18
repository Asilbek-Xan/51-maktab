const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (configuredSiteUrl
  ? `${/^https?:\/\//i.test(configuredSiteUrl) ? '' : 'https://'}${configuredSiteUrl}`.replace(/\/$/, '')
  : null) as string | null;

export function absoluteSiteUrl(path = '/') {
  if (!SITE_URL) return undefined;
  return new URL(path, `${SITE_URL}/`).toString();
}

export const SITE_NAME = '51-sonli maktab';
export const OG_IMAGE = '/og-image.png';

/**
 * Maktab joylashuvi. Admin paneldagi latitude/longitude to'ldirilsa — o'sha ishlatiladi.
 * Aks holda shu zaxira qiymatlar. Aniq koordinatani Google Maps'da maktab binosini
 * o'ng tugma bilan bosib olib, LAT/LNG ga yozing (masalan 37.4123, 66.8456).
 */
export const SCHOOL_LOCATION = {
  address: "51-sonli maktab, Do'stlik MFY, Muzrabot tumani, Surxondaryo viloyati",
  lat: 37.44628266854656 as number | null,
  lng: 66.81926920101212 as number | null,
};

export function schoolGeo(school?: { latitude?: string | null; longitude?: string | null; address?: string } | null) {
  const lat = Number.parseFloat(school?.latitude ?? '') || SCHOOL_LOCATION.lat;
  const lng = Number.parseFloat(school?.longitude ?? '') || SCHOOL_LOCATION.lng;
  const hasCoords = lat != null && lng != null;
  const query = hasCoords ? `${lat},${lng}` : SCHOOL_LOCATION.address;
  const q = encodeURIComponent(query);
  return {
    lat: hasCoords ? lat : null,
    lng: hasCoords ? lng : null,
    embedUrl: `https://maps.google.com/maps?q=${q}&z=${hasCoords ? 16 : 14}&output=embed`,
    linkUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
  };
}
