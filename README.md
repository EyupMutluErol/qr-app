# Yeni Nesil QR Kod Yoklama ve Etkinlik Yönetim Sistemi
[![Canlı Demo](https://img.shields.io/badge/Canl%C4%B1_Demo-Vercel'de_İncele-black?style=for-the-badge&logo=vercel)](https://qr-app-xi-pink.vercel.app)


Bu proje, etkinliklerdeki yoklama süreçlerini dijitalleştirmek, hızlandırmak ve güvenli hale getirmek amacıyla geliştirilmiş tam yığın (full-stack) bir web uygulamasıdır. Katılımcılar saniyeler içinde dinamik QR kodları okutarak yoklamalarını verebilir, yöneticiler ise anlık olarak verileri harita ve grafik destekli panelden takip edebilir.

## Öne Çıkan Özellikler

- **Dinamik QR Kod Sistemi:** Zaman damgalı ve güvenli QR kodlar ile sahte yoklamaların önüne geçilir.
- **Harita Entegrasyonu (Smart Map):** Etkinlik konumları Nominatim API ve LeafletJS kullanılarak akıllı harita üzerinden seçilebilir.
- **Akıllı Öğrenci Yönetimi (Soft-Delete):** Öğrenciler silindiğinde geçmiş yoklama verileri kaybolmaz (`isActive` mimarisi). İstenildiğinde tek tıkla sisteme geri alınabilir.
- **Toplu Veri İşlemleri:** Excel/CSV formatında toplu öğrenci ekleme ve indirme desteği.
- **Gelişmiş UI/UX:** Neon konseptli karanlık tema, özel Toast bildirimleri ve tamamen mobil uyumlu (responsive) tasarım.
- **Güvenli Yönetici Paneli:** JWT ve Bcrypt kullanılarak şifrelenmiş, yetkisiz erişime kapalı yönetici arayüzü.

## Kullanılan Teknolojiler

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS
- **Backend:** Next.js Route Handlers (API)
- **Veritabanı:** PostgreSQL (Neon.tech Bulut Veritabanı)
- **ORM:** Prisma
- **Harita & Konum:** React-Leaflet, Nominatim API
- **Güvenlik:** JWT (JSON Web Tokens), Bcryptjs

## Kurulum ve Lokal Geliştirme (Local Development)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Depoyu Klonlayın
\`\`bash
git clone https://github.com/EyupMutluErol/qr-app.git
cd qr-app
\`\`

### 2. Bağımlılıkları Yükleyin
\`\`bash
npm install
\`\`

### 3. Çevre Değişkenlerini (Environment Variables) Ayarlayın
Proje ana dizininde bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri kendi bilgilerinize göre doldurun:
env
DATABASE_URL="postgresql://kullaniciadi:sifre@host:port/veritabani_adi?sslmode=require"
JWT_SECRET="kendi_belirlediginiz_guclu_gizli_kelime"
INITIAL_ADMIN_PASSWORD="sisteme_ilk_giris_sifreniz"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"


### 4. Veritabanını İnşa Edin
\`\`bash
npx prisma db push
\`\`

### 5. İlk Yöneticiyi (Admin) Oluşturun
Proje lokalde çalışırken tarayıcıdan \`http://localhost:3000/api/admin/setup\` adresine giderek ilk yöneticinizi veritabanına kaydedin.

### 6. Projeyi Başlatın
\`\`bash
npm run dev
\`\`
Proje \`http://localhost:3000\` adresinde çalışmaya başlayacaktır.

## ☁️ Canlıya Alma (Deployment)

Bu proje **Vercel** üzerinde barındırılmak üzere optimize edilmiştir. Vercel paneli üzerinden GitHub reponuzu bağladıktan sonra, yukarıdaki `.env` değişkenlerini Vercel'in "Environment Variables" sekmesine (NEXT_PUBLIC_SITE_URL değerini Vercel'in verdiği canlı link ile değiştirerek) eklemeniz yeterlidir.

---
*Geliştirici:* Eyüp Mutlu Erol