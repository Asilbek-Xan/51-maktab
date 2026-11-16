const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (configuredSiteUrl
  ? `${/^https?:\/\//i.test(configuredSiteUrl) ? '' : 'https://'}${configuredSiteUrl}`.replace(/\/$/, '')
  : null) as string | null;

export function absoluteSiteUrl(path = '/') {
  if (!SITE_URL) return undefined;
  return new URL(path, `${SITE_URL}/`).toString();
}
