# Railway Ticket — frontend

Vue 3 + TypeScript + Vite. Och rangli, yashil aksentli Telegram Mini App boshlang‘ichi.

## Lokal ishga tushirish

Node.js 20.19+ yoki 22.12+ kerak (Node 21 qo‘llanmaydi).

NVM ishlatsangiz, `.nvmrc`dagi versiyani `nvm use` bilan tanlang. Kompyuteringizda Node’ning bir nechta versiyasi bo‘lsa, `node -v` bilan tekshiring.

```sh
npm install
npm run dev
```

Brauzerda http://127.0.0.1:5173 manzilini oching. Forma oddiy brauzerda ham kuzatuvlarni backend API’si orqali saqlaydi. Backend autentifikatsiya talab qilsa, Telegram Mini App orqali kirish kerak; `401` javobi interfeysda ko‘rsatiladi. Telegram foydalanuvchisi sun’iy yaratilmaydi.

## Hozir mavjud

- Asosiy sahifa, kuzatuvlar va profil; mobil navigatsiya.
- `/watches/new` sahifasida kuzatuv yaratish; `/drafts/:id/edit` avvalgi lokal qoralamani forma ichida ochib, serverda kuzatuv yaratishga imkon beradi. Mobil formaning saqlash tugmasi pastda doim ko‘rinadi, orqaga tugmasi oldingi sahifaga qaytaradi.
- Safar sanasi, jo‘nash va borish bekati, joy pozitsiyasi, zona va statik vagon filtrlari.
- Yangi qoralamalar `localStorage`ga yozilmaydi. Avval saqlanganlari “Kuzatuvlar” sahifasidagi alohida ro‘yxatda qoladi; ularni ochish, qidirish va o‘chirish mumkin.
- Telegram Mini App’dan `GET /api/v1/me` orqali haqiqiy profil olish; yuklanish va xato holatlari.
- Kuzatuvlarni serverdan olish, yaratish va o‘chirish; yuklanish, server xatolari va ro‘yxatni yangilash.
- Asosiy sahifa, profil va navigatsiyadagi kuzatuvlar soni serverdagi ro‘yxatga bog‘langan.

Saqlash har doim `POST /api/v1/watches` orqali bajariladi. Server xato qaytarsa, ma’lumotlar formada qoladi; brauzerga qoralama sifatida saqlanmaydi. Avvalgi qoralamalar avtomatik serverga yuborilmaydi va kuzatuv yaratilganda ham o‘chirilmaydi. `from` va `to` bekat kodlari, sana esa `trip_date` bilan yuboriladi. Tanlangan poyezd raqamlari `filters.trains`ga yoziladi; hech biri tanlanmasa, bo‘sh ro‘yxat barcha poyezdlarni bildiradi. Tezyurar poyezdlar uchun klass tanlovi `filters.classes`ga `economy`, `business`, `vip` qiymatlari bilan yuboriladi. Bir nechta klassni tanlash mumkin; bo‘sh ro‘yxat barcha klasslarni bildiradi. Bular frontend filtri qiymatlari; ularni E-ticket’dagi `classServiceType` kodlariga moslash backendda bajariladi.

Bekatlar `GET /api/v1/stations?lang=uz|ru|en`dan olinadi. Jo‘nash, borish va sana tanlanganda `GET /api/v1/trains?from=...&to=...&trip_date=YYYY-MM-DD&lang=uz` yuboriladi. **Saqlangan kuzatuvlar uchun avtomatik tekshiruv hali ulanmagan.** Joylarni tekshirish va Telegram xabarlari keyingi bosqichlarda ulanadi. Frontendda kuzatuv yaratish va o‘chirish mavjud.

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

Telegram `initData` mavjud bo‘lsa, kuzatuvlar so‘rovlariga `Authorization` qo‘shiladi; oddiy brauzerda bu header yuborilmaydi. Autentifikatsiya va foydalanuvchini aniqlash backend zimmasida. `422` xatolar forma maydonlarida ko‘rsatiladi. Kuzatuvlar so‘rovlari 12, poyezd qidiruvi 20 soniyadan keyin to‘xtatiladi; yaratish va o‘chirish avtomatik takrorlanmaydi.

## Buyruqlar

| Buyruq | Vazifa |
| --- | --- |
| `npm run dev` | Development, 5173 port (band bo‘lsa boshqa portga yashirin o‘tmaydi) |
| `npm run typecheck` | TypeScript tekshiruvi |
| `npm run build` | TypeScript tekshiruvi va `dist/`ga production build |
| `npm run preview` | Build’ni lokal ko‘rish; API proxy yo‘q, production server sifatida ishlatilmaydi |
| `make` | Makefile buyruqlarini ko‘rsatish |
| `make install` | Kutubxonalarni lock fayl bo‘yicha o‘rnatish |
| `make dev` | Frontendni lokal ishga tushirish |
| `make build` | Production build tayyorlash |
| `make setup-deploy` | Lokal `deploy.mk` sozlama faylini yaratish |
| `make deploy` | Build qilish va serverga yuklash |
| `make upload` | Mavjud `dist/`ni qayta build qilmasdan yuklash |

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

## Serverga yuklash

Kompyuteringizda Node.js va npm, SSH/SCP kerak. Serverga tayyor `dist/` fayllari yuklanadi; frontendni Nginx tarqatadi.

Bir marta sozlang:

```sh
make setup-deploy
```

`deploy.mk` ichida SSH manzili yoki aliasi, port va server papkasini yozing:

```makefile
DEPLOY_SSH := deploy@example.com
DEPLOY_PORT := 22
DEPLOY_PATH := /var/www/ticket-frontend
```

`deploy.mk` Git’dan chiqarilgan. SSH kaliti va ulanish sozlamalari odatdagi SSH config/agent orqali ishlaydi. Server papkasi SSH foydalanuvchisi uchun yoziladigan, Nginx uchun o‘qiladigan bo‘lsin. Boshqa sayt fayllari bilan bitta papkani ishlatmang.

Keyingi yuklashlar:

```sh
make deploy
```

Bu buyruq lokal build tayyorlaydi, avval assetlarni yuklaydi, keyin `index.html`ni vaqtinchalik fayl orqali almashtiradi. Yuklash to‘xtasa, eski `index.html` qoladi. Oldingi assetlar saqlanadi, shu sababli avval ochilgan sahifa ham o‘z fayllarini topa oladi. Faqat tayyor buildni yuklash uchun `make upload` ishlating.

Nginx statik fayllarni tarqatadi (`try_files $uri $uri/ /index.html`), `/api/`ni Goravel backend’ga yo‘naltiradi. Tayyor konfiguratsiya `nginx.conf` faylida: `ticket.example.com`ni o‘z domeningizga almashtiring. Backend `127.0.0.1:8080`da ishlashi kerak. Frontend va API bir origin ostida ishlaydi. `DEPLOY_PATH` domenning Nginx `root` qiymatiga mos bo‘lishi kerak; domen va HTTPS sozlamalari serverda alohida o‘rnatiladi. Statik fayllarni yangilaganda Nginx’ni qayta ishga tushirish kerak emas.

Interfeys mobil ilova oqimiga moslangan. Telefonga PWA sifatida o‘rnatish uchun manifest va service worker keyingi bosqichda qo‘shiladi.
