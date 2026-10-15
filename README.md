# Benzer Playlist

Spotify'ın kaldırdığı "benzer playlist" özelliğinin yerine: bir playlist linki ver ya da birkaç şarkı seç, Last.fm
benzerlik verisiyle benzer şarkılardan liste öner. **Giriş gerekmez**; istersen Spotify ile bağlanıp sonucu hesabına
gizli playlist olarak kaydedersin, bağlanmazsan linkleri kopyalayıp Spotify masaüstünde bir playlist'e yapıştırırsın.

## Kurulum

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → **Create app** → Web API seç.
   - Redirect URI: `http://127.0.0.1:3000/api/auth/callback` (Spotify `localhost` kabul etmiyor);
     canlı ortam için `https://<domain>/api/auth/callback` da ekle.
   - Settings'ten **Client ID** ve **Client secret**'ı al (secret girişsiz arama için).
   - Development mode'da sadece **User Management**'a eklenen hesaplar giriş yapabilir (en fazla 5),
     ve app sahibinin Premium olması gerekiyor.
2. [Last.fm API hesabı](https://www.last.fm/api/account/create) aç, API key al.
3. `.env.local` dosyasını doldur (şablon: `.env.example`).
4. `npm install && npm run dev` → **http://127.0.0.1:3000**

## Nasıl çalışır

- Kaynak: kendi playlist'in Web API'den (tam liste); başka playlist'ler ve girişsiz kullanım için Spotify'ın public
  embed sayfasından (ilk ~50 şarkı); ya da arayıp seçtiğin 1–10 şarkı.
- Kaynak şarkılardan, sanatçılara dengeli dağılmış en fazla 30 "tohum" seçilir.
- Her tohum için Last.fm `track.getSimilar` çağrılır (veri yoksa benzer sanatçıların popüler şarkıları).
- Birden çok tohumun önerdiği şarkılar öne çıkar; kaynakta olanlar elenir, sanatçı başına en fazla 2 şarkı.
- Adaylar Spotify'da aranıp eşleştirilir (remix/live sürümler orijinalle karıştırılmaz).

Kod: `lib/similar.ts` (saf öneri mantığı), `lib/generate.ts` (akış), `lib/spotify.ts`, `lib/lastfm.ts`.

## Sınırlamalar (Spotify Web API, Şubat 2026 dev-mode kuralları)

- Web API sadece **sahibi olduğun veya ortak düzenlediğin** playlist'leri okutuyor; diğerleri embed sayfasından okunuyor.
  Embed resmi bir API değil: ilk ~50 şarkıyı veriyor ve Spotify sayfayı değiştirirse bozulabilir
  (şarkı seçerek başlama modu etkilenmez).
- Girişsiz kullanım tek app'in Spotify/Last.fm kotasını paylaşır; IP başına basit bir istek sınırı var
  (benzer liste: 6 / 10 dk, arama: 60 / dk).
- Development mode'da Spotify'a **kaydetmek** için giriş yine en fazla 5 kişiyle sınırlı.
- Spotify'ın `recommendations` / `related-artists` endpoint'leri yeni app'lere kapalı; bu yüzden Last.fm kullanılıyor.

## Komutlar

`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test`
