# Facility Maintenance Manager

Üretim kalitesinde bakım talep yönetimi uygulaması. Tesis operasyon ekipleri,
bakım taleplerini hızlıca oluşturur, önceliklendirir ve çözüme ulaştırır.

## Özellikler
- JWT tabanlı kimlik doğrulama ve rol bazlı yetkilendirme (admin / user)
- Bakım talepleri için CRUD
- Pagination + filtering + sorting
- Global error handling ve doğrulama
- Responsive React arayüz
- Prisma + PostgreSQL + seed yapısı

## Monorepo Yapısı
- `backend/` → REST API + Prisma + Auth
- `frontend/` → React + TypeScript + Zustand + React Hook Form

## Klasör Yapısı (Neden Var?)
### Backend
- `controllers/` → HTTP isteklerini karşılar, servisleri çağırır.
- `services/` → İş kuralları ve veri erişim mantığı.
- `routes/` → Endpoint tanımları ve middleware bağlama.
- `middlewares/` → Auth, validation, error handling gibi çapraz kesen işler.
- `models/` → Domain tipleri ve enumlar.
- `utils/` → Tekrar eden yardımcı fonksiyonlar (JWT, pagination, hashing).
- `config/` → Ortam değişkenleri ve Prisma bağlantısı.
- `prisma/` → Schema, migration ve seed dosyaları.

### Frontend
- `components/` → Tekrar kullanılabilir UI bileşenleri.
- `pages/` → Route seviyesindeki ekranlar.
- `hooks/` → Ortak veri/iş mantığı hook'ları.
- `services/` → API istekleri.
- `types/` → Uygulama genelindeki TypeScript tipleri.
- `store/` → Zustand store (global state).
- `styles/` → Global stil dosyaları.

## Database Schema (Prisma)
```
User(id, name, email, passwordHash, role, createdAt, updatedAt)
MaintenanceRequest(id, title, description, location, category, priority, status, requesterId, createdAt, updatedAt)
```

## Kurulum
### 1) Backend
```
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### 2) Frontend
```
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000`

## Seed Kullanıcıları
- Admin → `admin@facility.com` / `Admin123!`
- User → `user@facility.com` / `User123!`

## API Dokümantasyonu
- `backend/docs/api.md`

## Ortam Değişkenleri
### Backend
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/maintenance_app?schema=public
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

### Frontend
```
VITE_API_URL=http://localhost:4000/api
```

## Test Senaryoları (Örnek)
1. Admin ile giriş yap, tüm talepleri listele.
2. User ile giriş yap, sadece kendi taleplerini gör.
3. Yeni talep oluştur, liste ekranında görünür olmalı.
4. Admin, bir talebin durumunu `IN_PROGRESS` yapabilmeli.
5. User, status alanını güncelleyememeli (403).
6. Pagination ile 2. sayfaya geçiş yap.
7. `priority=HIGH` filter uygula.
8. `sortBy=createdAt&sortOrder=desc` ile sıralamayı doğrula.