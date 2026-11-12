export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'image' | 'date' | 'datetime-local' | 'email';

export interface Field {
  name: string; label: string; type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean; hint?: string;
}
export interface Resource {
  key: string; title: string; single: string; endpoint: string;
  columns: { name: string; label: string; kind?: 'image' | 'bool' | 'date' }[];
  fields: Field[];
  readOnly?: boolean;       // faqat ko'rish va o'chirish (murojaatlar)
  singleton?: boolean;      // bitta yozuv (maktab ma'lumoti)
  titleField: string;
}

export const RESOURCES: Resource[] = [
  {
    key: 'news', title: 'Yangiliklar va e’lonlar', single: 'yangilik', endpoint: 'news', titleField: 'title',
    columns: [{ name: 'image', label: 'Rasm', kind: 'image' }, { name: 'title', label: 'Sarlavha' }, { name: 'kind_label', label: 'Turi' }, { name: 'is_pinned', label: 'Muhim', kind: 'bool' }, { name: 'published_at', label: 'Sana', kind: 'date' }],
    fields: [
      { name: 'title', label: 'Sarlavha', type: 'text', required: true },
      { name: 'kind', label: 'Turi', type: 'select', options: [{ value: 'yangilik', label: 'Yangilik' }, { value: 'elon', label: 'E’lon' }] },
      { name: 'summary', label: 'Qisqa mazmuni', type: 'textarea' },
      { name: 'content', label: 'To‘liq matn', type: 'textarea' },
      { name: 'image', label: 'Rasm', type: 'image' },
      { name: 'is_pinned', label: 'Muhim (tepada turadi)', type: 'checkbox' },
    ],
  },
  {
    key: 'teachers', title: 'Rahbariyat va xodimlar', single: 'xodim', endpoint: 'teachers', titleField: 'full_name',
    columns: [{ name: 'photo', label: 'Rasm', kind: 'image' }, { name: 'full_name', label: 'F.I.Sh.' }, { name: 'position', label: 'Lavozim' }, { name: 'subject', label: 'Fan' }, { name: 'category_label', label: 'Toifa' }],
    fields: [
      { name: 'full_name', label: 'F.I.Sh.', type: 'text', required: true },
      { name: 'position', label: 'Lavozimi', type: 'text' },
      { name: 'subject', label: 'Fani', type: 'text' },
      { name: 'category', label: 'Toifa (kod)', type: 'text', hint: 'Backenddagi toifa kodi bilan bir xil yozing' },
      { name: 'experience_years', label: 'Tajriba (yil)', type: 'number' },
      { name: 'photo', label: 'Rasm', type: 'image' },
      { name: 'bio', label: 'Qisqacha ma’lumot', type: 'textarea' },
    ],
  },
  {
    key: 'achievements', title: 'Yutuqlar', single: 'yutuq', endpoint: 'achievements', titleField: 'title',
    columns: [{ name: 'image', label: 'Rasm', kind: 'image' }, { name: 'title', label: 'Yutuq' }, { name: 'student_name', label: 'O‘quvchi' }, { name: 'level_label', label: 'Daraja' }, { name: 'place', label: 'O‘rin' }],
    fields: [
      { name: 'title', label: 'Yutuq nomi', type: 'text', required: true },
      { name: 'student_name', label: 'O‘quvchi', type: 'text' },
      { name: 'grade', label: 'Sinf', type: 'text' },
      { name: 'level', label: 'Daraja (kod)', type: 'text' },
      { name: 'place', label: 'O‘rin', type: 'number' },
      { name: 'date', label: 'Sana', type: 'date' },
      { name: 'image', label: 'Rasm', type: 'image' },
      { name: 'description', label: 'Izoh', type: 'textarea' },
    ],
  },
  {
    key: 'banners', title: 'Bosh sahifa bannerlari', single: 'banner', endpoint: 'banners', titleField: 'title',
    columns: [{ name: 'image', label: 'Rasm', kind: 'image' }, { name: 'title', label: 'Sarlavha' }, { name: 'subtitle', label: 'Matn' }],
    fields: [
      { name: 'title', label: 'Sarlavha', type: 'text', required: true },
      { name: 'subtitle', label: 'Matn', type: 'textarea' },
      { name: 'image', label: 'Rasm', type: 'image' },
      { name: 'button_text', label: 'Tugma matni', type: 'text' },
      { name: 'link_url', label: 'Tugma havolasi', type: 'text' },
    ],
  },
  {
    key: 'messages', title: 'Murojaatlar', single: 'murojaat', endpoint: 'messages', titleField: 'name', readOnly: true,
    columns: [{ name: 'name', label: 'Kimdan' }, { name: 'phone', label: 'Telefon' }, { name: 'message', label: 'Matn' }, { name: 'created_at', label: 'Sana', kind: 'date' }],
    fields: [
      { name: 'name', label: 'Ism', type: 'text' }, { name: 'phone', label: 'Telefon', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' }, { name: 'message', label: 'Matn', type: 'textarea' },
    ],
  },
  {
    key: 'school', title: 'Maktab ma’lumotlari', single: 'ma’lumot', endpoint: 'school', titleField: 'name', singleton: true,
    columns: [],
    fields: [
      { name: 'name', label: 'To‘liq nomi', type: 'text', required: true },
      { name: 'short_name', label: 'Qisqa nomi', type: 'text' },
      { name: 'district', label: 'Tuman / viloyat', type: 'text' },
      { name: 'logo', label: 'Logotip', type: 'image', hint: 'Saytning yuqori chap qismida ko‘rinadi' },
      { name: 'tagline', label: 'Shior', type: 'text' },
      { name: 'welcome_text', label: 'Bosh sahifa sarlavhasi', type: 'text' },
      { name: 'intro_text', label: 'Bosh sahifa qisqa matni', type: 'textarea' },
      { name: 'description', label: 'Maktab haqida', type: 'textarea' },
      { name: 'history', label: 'Tarix', type: 'textarea' },
      { name: 'director_name', label: 'Direktor F.I.Sh.', type: 'text' },
      { name: 'director_photo', label: 'Direktor rasmi', type: 'image' },
      { name: 'director_message', label: 'Direktor murojaati', type: 'textarea' },
      { name: 'address', label: 'Manzil', type: 'text' },
      { name: 'phone', label: 'Telefon', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'working_hours', label: 'Qabul vaqti', type: 'text' },
      { name: 'telegram', label: 'Telegram havolasi', type: 'text' },
      { name: 'instagram', label: 'Instagram havolasi', type: 'text' },
      { name: 'facebook', label: 'Facebook havolasi', type: 'text' },
      { name: 'youtube', label: 'YouTube havolasi', type: 'text' },
    ],
  },
];

export const getResource = (key: string) => RESOURCES.find((r) => r.key === key);
export const COOKIE = 'panel_token';
