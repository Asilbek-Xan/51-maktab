# 51-maktab — sayt + alohida admin panel

## Ishga tushirish
```bash
npm install
npm run dev        # http://localhost:3000
```
`.env.local`: `NEXT_PUBLIC_API_URL` (asosiy API) va `PANEL_API_PREFIX` (admin panel API).

## Nima o'zgardi
- Dizayn referens saytdagi uslubda (yorqin ko'k hero, yumaloq kartalar, light tema).
- Navbar/footer'dagi "51" belgisi olib tashlandi — logotip `GET /api/v1/school/` dagi `logo` maydonidan olinadi.
- Tezlik: `no-store` va `force-dynamic` olib tashlandi → sahifalar 60 soniya keshlanadi (ISR),
  API 8 soniyada javob bermasa sahifa qotib qolmaydi, rasmlar lazy-load.
- Yangiliklar uchun alohida sahifa: `/yangiliklar/[slug]`.

## Admin panel (`/admin`)
Django adminidan butunlay alohida, yengil va light. Faqat: yangiliklar, murojaatlar, xodimlar, yutuqlar,
bannerlar va maktab ma'lumoti (logotip bilan). Token httpOnly cookie'da, brauzer JS'ida ko'rinmaydi.
Backend tomoni: `backend/panel_api.py` (cheklangan DRF endpointlar + "Maktab xodimi" guruhi) —
fayl ichidagi 4 qadamni bajaring. Panel o'zgartirgach, sayt keshi darhol yangilanadi.
