export const API_BASE_URL = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://maktab51.pythonanywhere.com').replace(/\/$/, '');
export const API_V1_PREFIX = '/api/v1';

/** Sahifalar necha soniya keshda turadi (PythonAnywhere sekin bo'lgani uchun har so'rovda urilmaymiz). */
export const REVALIDATE = 60;

/** Backend nisbiy yo'l ("/media/logo.png") qaytarsa ham ishlaydi. */
export function mediaUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
  return `${API_BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}

export async function apiGet<T>(path: string, revalidate: number = REVALIDATE): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
      next: { revalidate, tags: ['api'] },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`API GET ${path} returned HTTP ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Xato bo'lsa sahifa yiqilmasin: null qaytaradi. */
export async function safeGet<T>(path: string, revalidate: number = REVALIDATE): Promise<T | null> {
  try {
    return await apiGet<T>(path, revalidate);
  } catch (error) {
    console.error('API error:', error instanceof Error ? error.message : error);
    return null;
  }
}

export interface SchoolProfile {
  name: string; short_name: string; district: string; tagline: string;
  welcome_text: string; intro_text: string; logo: string | null;
  description: string; history: string;
  director_name: string; director_photo: string | null; director_message: string;
  address: string; phone: string; email: string; working_hours: string;
  latitude: string | null; longitude: string | null;
  telegram: string; instagram: string; facebook: string; youtube: string;
}
export interface NewsItem {
  id: number; title: string; slug: string; kind: 'yangilik' | 'elon'; kind_label: string;
  summary: string; image: string | null; thumbnail: string | null;
  is_pinned: boolean; published_at: string | null; content?: string;
}
export interface TeacherItem {
  id: number; full_name: string; subject: string; position: string;
  category: string; category_label: string; experience_years: number | null;
  photo: string | null; bio: string;
}
export interface BannerItem { id: number; title: string; subtitle: string; image: string; link_url: string; button_text: string; }
export interface AchievementItem {
  id: number; title: string; student_name: string; grade: string; level: string; level_label: string;
  place: number | null; date: string; description: string; image: string | null;
}
export interface EventItem {
  id: number; title: string; slug: string; event_date: string; excerpt: string;
  cover: { image: string; thumbnail: string | null } | null; photos_count: number;
  category: { name: string; slug: string };
}
export interface HomeData {
  school: SchoolProfile; banners: BannerItem[]; latest_events: EventItem[];
  news: NewsItem[]; achievements: AchievementItem[]; teachers_count: number;
}
export interface Paginated<T> { count: number; next: string | null; previous: string | null; results: T[]; }

export function dateLabel(value: string | null | undefined) {
  if (!value) return '';
  return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium' }).format(new Date(value));
}
