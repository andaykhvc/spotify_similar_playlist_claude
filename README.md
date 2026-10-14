# Benzer Playlist

Spotify'ın kaldırdığı "benzer playlist" özelliğinin yerine: bir playlist seç, Last.fm benzerlik verisiyle
benzer şarkılardan yeni bir playlist öner, beğendiklerini Spotify hesabına gizli playlist olarak kaydet.

## Kurulum

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → **Create app** → Web API seç.
   - Redirect URI: `http://127.0.0.1:3000/api/auth/callback` (Spotify `localhost` kabul etmiyor).
   - Development mode'da sadece **User Management**'a eklenen hesaplar giriş yapabilir (en fazla 5),
     ve app sahibinin Premium olması gerekiyor.
2. [Last.fm API hesabı](https://www.last.fm/api/account/create) aç, API key al.
3. `.env.local` dosyasını doldur (şablon: `.env.example`).
4. `npm install && npm run dev` → **http://127.0.0.1:3000**

## Nasıl çalışır

- Playlist şarkıları Spotify'dan okunur, sanatçılara dengeli dağılmış en fazla 30 "tohum" seçilir.
- Her tohum için Last.fm `track.getSimilar` çağrılır (veri yoksa benzer sanatçıların popüler şarkıları).
- Birden çok tohumun önerdiği şarkılar öne çıkar; kaynakta olanlar elenir, sanatçı başına en fazla 2 şarkı.
- Adaylar Spotify'da aranıp eşleştirilir (remix/live sürümler orijinalle karıştırılmaz).

Kod: `lib/similar.ts` (saf öneri mantığı), `lib/generate.ts` (akış), `lib/spotify.ts`, `lib/lastfm.ts`.

## Sınırlamalar (Spotify Web API, Şubat 2026 dev-mode kuralları)

- Sadece **sahibi olduğun veya ortak düzenlediğin** playlist'lerin şarkıları okunabiliyor. Başkasının
  playlist'i için önce Spotify'da kendi hesabına kopyala.
- Spotify'ın `recommendations` / `related-artists` endpoint'leri yeni app'lere kapalı; bu yüzden Last.fm kullanılıyor.

## Komutlar

`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test`
