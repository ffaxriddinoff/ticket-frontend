# Railway Ticket — frontend

Vue 3 + TypeScript + Vite. Och rangli, yashil aksentli Telegram Mini App boshlang‘ichi.

## Lokal ishga tushirish

Node.js 20.19+ yoki 22.12+ kerak (Node 21 qo‘llanmaydi).

NVM ishlatsangiz, `.nvmrc`dagi versiyani `nvm use` bilan tanlang. Kompyuteringizda Node’ning bir nechta versiyasi bo‘lsa, `node -v` bilan tekshiring.

```sh
npm install
npm run dev
```

Brauzerda http://127.0.0.1:5173 manzilini oching. Oddiy brauzerda profilga kirishsiz frontend va lokal qoralamalar ishlaydi. Telegram foydalanuvchisi sun’iy yaratilmaydi.

## Hozir mavjud

- Asosiy sahifa, kuzatuvlar va profil; mobil navigatsiya.
- `/watches/new` sahifasida safar yaratish; `/drafts/:id/edit` sahifasida lokal qoralamani tahrirlash. Mobil formaning saqlash tugmasi pastda doim ko‘rinadi, orqaga tugmasi oldingi sahifaga qaytaradi.
- Qoralama yaratish, tahrirlash, o‘chirish va marshrut bo‘yicha qidirish.
- Safar sanasi, jo‘nash va borish bekati, joy pozitsiyasi, zona va statik vagon filtrlari.
- Qoralamalar `localStorage`da saqlanadi (50 tagacha); ular faqat shu brauzerda mavjud, hisobga sinxronlanmaydi.
- Telegram Mini App’dan `GET /api/v1/me` orqali haqiqiy profil olish; yuklanish va xato holatlari.
- Tasdiqlangan Telegram profili bilan kuzatuvlarni serverdan olish, yaratish va o‘chirish; ro‘yxatni yangilash va marshrut bo‘yicha qidirish.
- Asosiy sahifa, profil va navigatsiyadagi kuzatuvlar soni serverdagi ro‘yxatga bog‘langan.

Telegram’dan kirilganda yangi kuzatuv hisobga saqlanadi; oddiy brauzerda lokal qoralamalar ishlaydi. Avvalgi qoralamalar avtomatik serverga yuborilmaydi. `from` va `to` hozircha foydalanuvchi kiritgan yo‘nalish nomlari, API’da sana `trip_date` bilan yuboriladi. Jo‘nash va borish qiymatlari serverda 30 belgi bilan cheklangan. `filters.trains` va `filters.classes` hozircha bo‘sh ro‘yxat sifatida yuboriladi.

**Saqlangan kuzatuvlar uchun avtomatik tekshiruv hali ulanmagan.** Eticket, poyezdlar ro‘yxati, class tanlovi, joylarni tekshirish, Telegram xabarlari, bron va to‘lov keyingi bosqichlarda ulanadi. Serverdagi kuzatuvlar uchun tahrirlash endpoint’i hali yo‘q; frontendda yaratish va o‘chirish mavjud.

## Goravel backend bilan ulash

`ticket-backend` papkasida alohida terminalda `make run` bilan Goravel’ni ishga tushiring. Vite `/api`, `/health`, `/ready` so‘rovlarini `http://127.0.0.1:8080`ga yo‘naltiradi. Bu backend’dagi amaldagi `APP_PORT=8080` sozlamasiga mos; development uchun CORS qo‘shish shart emas.

Kerak bo‘lsa `.env.example`dan `.env` yarating:

```dotenv
API_PROXY_TARGET=http://127.0.0.1:8080
VITE_TELEGRAM_BOT_USERNAME=
```

`VITE_*` qiymatlari frontend build’ida hammaga ko‘rinadi. **Bot tokenini frontend’ga qo‘ymang**; u faqat Go backend’dagi `TELEGRAM_BOT_TOKEN`da saqlanadi. `.env`ni o‘zgartirgach Vite’ni qayta ishga tushiring.

Telegram SDK bergan xom `initData` faqat `Authorization: tma <initData>` orqali backend’ga yuboriladi. U xotirada qoladi; `localStorage`ga, logga yoki URL’ga yozilmaydi. `initDataUnsafe` autentifikatsiya uchun ishlatilmaydi. Oddiy brauzerda Telegram auth’ni tekshirib bo‘lmaydi: buning uchun Mini App’ni botdan HTTPS manzil orqali ochish kerak.

Kuzatuvlar API’si:

- `GET /api/v1/watches` — `{ "data": [...] }`.
- `POST /api/v1/watches` — `{ from, to, trip_date, filters }`, javob `201` va `{ "data": watch }`.
- `DELETE /api/v1/watches/{id}` — muvaffaqiyatli javob `204`, tana bo‘sh.

Barcha so‘rovlar Telegram autentifikatsiyasi bilan yuboriladi. `422` xatolar forma maydonlarida ko‘rsatiladi. So‘rovlar 12 soniyadan keyin to‘xtatiladi; yaratish va o‘chirish avtomatik takrorlanmaydi.

## Buyruqlar

| Buyruq | Vazifa |
| --- | --- |
| `npm run dev` | Development, 5173 port (band bo‘lsa boshqa portga yashirin o‘tmaydi) |
| `npm run typecheck` | TypeScript tekshiruvi |
| `npm run build` | TypeScript tekshiruvi va `dist/`ga production build |
| `npm run preview` | Build’ni lokal ko‘rish; API proxy yo‘q, production server sifatida ishlatilmaydi |

Testlar foydalanuvchi ko‘rsatmasiga muvofiq qo‘shilmagan.

## Tuzilish

```text
src/
  components/    # UI, kuzatuv/qoralama kartalari va ro‘yxat
  composables/   # Profil, server kuzatuvlari, qoralamalar va xabar holati
  lib/           # HTTP, Telegram SDK va sana funksiyalari
  types/         # API profili, kuzatuvlar va lokal qoralama tiplari
  views/         # Asosiy, kuzatuvlar, profil va safar formasi
  router.ts
  style.css
```

Serverga chiqarishda Nginx statik `dist/`ni tarqatadi (`try_files $uri $uri/ /index.html`), `/api/`, `/health`, `/ready`ni Goravel backend’ga yo‘naltiradi. Frontend va API bir origin ostida ishlaydi. Deploy konfiguratsiyasi keyingi bosqichda qo‘shiladi.

Interfeys mobil ilova oqimiga moslangan. Telefonga PWA sifatida o‘rnatish uchun manifest va service worker keyingi bosqichda qo‘shiladi.
