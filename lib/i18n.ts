// UI copy for both languages. English is the default; `tr` must mirror `en` key for key
// (enforced by its `typeof en` annotation). Safe to import from client and server code.

export type Lang = "en" | "tr";
export const DEFAULT_LANG: Lang = "en";

/** Error params travel from the server as JSON, so keep them to plain values. */
export type ErrorParam = string | number;
type Msg = (p: ErrorParam[]) => string;

const en = {
  tagline: "Find new songs that sound like a playlist you love, or a few songs you pick. No sign-up needed.",
  connect: "Connect Spotify",
  logout: "Log out",
  language: "Language",
  sourceLabel: "Source",
  tabLink: "Playlist link",
  tabSongs: "Songs",
  linkPlaceholder: "Playlist or profile link",
  linkLabel: "Spotify playlist or profile link",
  findSimilar: "Find similar songs",
  openingProfile: "Opening profile…",
  howMany: "How many songs",
  linkHelp:
    "Any public playlist works; for very long ones we look at the first 100 songs. Paste a profile link to list its playlists.",
  profileTitle: (name: string) => `Playlists on ${name}’s profile`,
  profileShowing: (total: number, shown: number) =>
    `This profile has ${total} public playlists; Spotify shows the first ${shown}.`,
  thisUser: "This user",
  searchLabel: "Search songs",
  searchPlaceholder: "Search for a song or artist",
  maxSeeds: (n: number) => `You can pick up to ${n} songs`,
  pickedSongs: "Picked songs",
  removeSong: (title: string) => `Remove ${title}`,
  findForSongs: (n: number) => (n === 1 ? "Find songs like this one" : `Find songs like these ${n}`),
  pickFirst: "Pick a few songs first",
  yourPlaylists: "Your playlists",
  loadingPlaylists: "Loading your playlists…",
  noPlaylists: "Your Spotify account has no playlists yet. Start with a link or a few songs above.",
  notYours: "Not yours, so we look at up to its first 100 songs",
  songCount: (n: number) => `${n} songs`,
  listening: (label: string | null) => (label ? `Listening to ${label}…` : "Listening to the playlist…"),
  searching: "Finding similar songs. This can take 10–30 seconds.",
  saved: "Saved.",
  savedBody: (name: string, count: number) =>
    `“${name}” was added to your Spotify account as a private playlist with ${count} songs.`,
  openInSpotify: "Open in Spotify",
  another: "Make another",
  newSearch: "New search",
  resultsSummary: (partial: boolean, sourceCount: number, kept: number) =>
    partial
      ? `${kept} songs similar to the first ${sourceCount} songs of this playlist.`
      : `${kept} songs similar to ${sourceCount === 1 ? "this song" : `these ${sourceCount} songs`}.`,
  resultsHint: "Remove the ones you don’t like, then save the rest.",
  playlistName: "New playlist name",
  saving: "Saving…",
  saveCount: (n: number) => `Save to Spotify (${n})`,
  saveShort: "Save to Spotify",
  connectAndSave: "Connect and save to Spotify",
  copied: "Copied",
  copyLinks: "Copy links",
  copyHelp: "Paste the copied links into a playlist in the Spotify desktop app to add the songs.",
  echoOf: (names: string) => `echoes ${names}`,
  remove: "Remove",
  addBack: "Add back",
  removeTrack: (name: string) => `Remove ${name}`,
  addTrackBack: (name: string) => `Add ${name} back`,
  playlistDescription: (source: string) => `Songs similar to “${source}”. Made with Echo List.`,
  footerSource: "Song info comes from",
  footerSimilarity: ", similarity data from Last.fm. Echo List is not affiliated with or endorsed by Spotify or Last.fm.",
  privacy: "Privacy",
  terms: "Terms",
  privacyHref: "/privacy",
  termsHref: "/terms",
  errors: {
    generic: () => "Something went wrong. Try again.",
    noResults: () => "No similar songs found for this. Try a few better-known songs.",
    clipboard: () => "Couldn’t copy the links. Your browser blocked clipboard access.",
    sessionExpired: () => "Your Spotify session ended. Connect again.",
    spotifyBusy: () => "Spotify is rate-limiting us. Try again in a minute.",
    rateLimited: (p) => `Too many requests. Try again in ${p[0]} minutes.`,
    lastfmDown: () => "Can’t reach Last.fm right now. Try again in a bit.",
    invalidLink: () => "Paste a valid Spotify playlist or profile link.",
    trackLink: () => "That’s a song link. Find the song in the Songs tab and pick it there.",
    albumArtistLink: () => "That’s an album or artist link. Paste a playlist link, or pick songs in the Songs tab.",
    profileLink: () => "That’s a profile link. Pick one of the profile’s playlists.",
    invalidProfileLink: () => "Paste a valid Spotify profile link.",
    playlistNotFound: () => "Playlist not found. Check the link and make sure the playlist is public.",
    playlistUnreadable: () => "Couldn’t read this playlist right now. It may be private; try picking a few songs in the Songs tab.",
    profileNotFound: () => "Spotify profile not found. Check the link.",
    profileUnreadable: () => "Couldn’t read this profile right now. Open one of its playlists and paste that link instead.",
    profileNoPlaylists: (p) => (p[0] ? `${p[0]} has no public playlists.` : "This profile has no public playlists."),
    emptyPlaylist: () => "This playlist has no songs to find echoes for.",
    seedCount: (p) => `Pick between 1 and ${p[0]} songs.`,
    seedsInvalid: () => "The picked songs are invalid.",
    nameMissing: () => "Give the playlist a name.",
    saveListInvalid: () => "The list of songs to save is invalid.",
    loginDenied: () => "Spotify access wasn’t granted. Connect again to save.",
    loginState: () => "The connection was interrupted. Connect again.",
    loginFailed: () => "Connecting to Spotify failed. Try again.",
    loginRejected: () =>
      "Spotify rejected the connection. While the app is in development mode, only accounts added under Spotify Dashboard → User Management can connect.",
  } satisfies Record<string, Msg>,
};

const tr: typeof en = {
  tagline: "Sevdiğin bir playlist'e ya da birkaç şarkıya benzeyen yeni şarkılar bul. Giriş gerekmez.",
  connect: "Spotify ile bağlan",
  logout: "Çıkış yap",
  language: "Dil",
  sourceLabel: "Kaynak",
  tabLink: "Playlist linki",
  tabSongs: "Şarkılar",
  linkPlaceholder: "Playlist ya da profil linki",
  linkLabel: "Spotify playlist ya da profil linki",
  findSimilar: "Benzerlerini bul",
  openingProfile: "Profil açılıyor…",
  howMany: "Kaç şarkı",
  linkHelp:
    "Herkese açık her playlist olur; çok uzunsa ilk 100 şarkısına bakılır. Profil linki verirsen playlist'lerini listeleriz.",
  profileTitle: (name) => `${name} profilindeki playlist'ler`,
  profileShowing: (total, shown) => `Profilde ${total} herkese açık playlist var; Spotify ilk ${shown} tanesini gösteriyor.`,
  thisUser: "Bu kullanıcı",
  searchLabel: "Şarkı ara",
  searchPlaceholder: "Şarkı ya da sanatçı ara",
  maxSeeds: (n) => `En fazla ${n} şarkı seçebilirsin`,
  pickedSongs: "Seçilen şarkılar",
  removeSong: (title) => `${title} şarkısını çıkar`,
  findForSongs: (n) => `${n} şarkının benzerlerini bul`,
  pickFirst: "Önce birkaç şarkı seç",
  yourPlaylists: "Playlist'lerin",
  loadingPlaylists: "Playlist'lerin yükleniyor…",
  noPlaylists: "Spotify hesabında henüz playlist yok. Yukarıdan bir link ya da şarkı ile başla.",
  notYours: "Senin olmadığı için en fazla ilk 100 şarkısına bakılır",
  songCount: (n) => `${n} şarkı`,
  listening: (label) => (label ? `${label} dinleniyor…` : "Playlist dinleniyor…"),
  searching: "Benzer şarkılar aranıyor. Bu 10–30 saniye sürebilir.",
  saved: "Kaydedildi.",
  savedBody: (name, count) => `"${name}" ${count} şarkıyla Spotify hesabına gizli playlist olarak eklendi.`,
  openInSpotify: "Spotify'da aç",
  another: "Yeni liste oluştur",
  newSearch: "Yeni arama",
  resultsSummary: (partial, sourceCount, kept) =>
    partial
      ? `Playlist'in ilk ${sourceCount} şarkısına benzeyen ${kept} şarkı.`
      : `${sourceCount} şarkıya benzeyen ${kept} şarkı.`,
  resultsHint: "Beğenmediklerini çıkar, kalanları kaydet.",
  playlistName: "Yeni playlist'in adı",
  saving: "Kaydediliyor…",
  saveCount: (n) => `Spotify'a kaydet (${n})`,
  saveShort: "Spotify'a kaydet",
  connectAndSave: "Bağlan ve Spotify'a kaydet",
  copied: "Kopyalandı",
  copyLinks: "Linkleri kopyala",
  copyHelp: "Kopyaladığın linkleri Spotify masaüstü uygulamasında bir playlist'e yapıştırırsan şarkılar eklenir.",
  echoOf: (names) => `${names} yankısı`,
  remove: "Çıkar",
  addBack: "Geri ekle",
  removeTrack: (name) => `${name} şarkısını çıkar`,
  addTrackBack: (name) => `${name} şarkısını geri ekle`,
  playlistDescription: (source) => `"${source}" ile benzer şarkılar. Echo List ile oluşturuldu.`,
  footerSource: "Şarkı bilgileri",
  footerSimilarity:
    "'dan, benzerlik verisi Last.fm'den gelir. Echo List, Spotify veya Last.fm ile bağlantılı değildir ve onlar tarafından onaylanmamıştır.",
  privacy: "Gizlilik ve KVKK",
  terms: "Kullanım koşulları",
  privacyHref: "/gizlilik",
  termsHref: "/kosullar",
  errors: {
    generic: () => "Bir şeyler ters gitti, tekrar dene.",
    noResults: () => "Bu kaynak için benzer şarkı bulunamadı. Daha bilinen birkaç şarkıyla dene.",
    clipboard: () => "Linkler kopyalanamadı. Tarayıcın panoya erişimi engelledi.",
    sessionExpired: () => "Oturumun düştü, tekrar giriş yap.",
    spotifyBusy: () => "Spotify istek sınırına takıldık, bir dakika sonra tekrar dene.",
    rateLimited: (p) => `Çok fazla istek attın, ${p[0]} dakika sonra tekrar dene.`,
    lastfmDown: () => "Last.fm'e şu an ulaşılamıyor, biraz sonra tekrar dene.",
    invalidLink: () => "Geçerli bir Spotify playlist ya da profil linki gir.",
    trackLink: () => "Bu bir şarkı linki. Şarkılar sekmesinden bu şarkıyı arayıp seçebilirsin.",
    albumArtistLink: () => "Bu bir albüm ya da sanatçı linki. Bir playlist linki yapıştır ya da Şarkılar sekmesinden şarkı seç.",
    profileLink: () => "Bu bir profil linki. Profildeki playlist'lerden birini seç.",
    invalidProfileLink: () => "Geçerli bir Spotify profil linki gir.",
    playlistNotFound: () => "Bu playlist bulunamadı. Linkin doğru ve playlist'in herkese açık olduğundan emin ol.",
    playlistUnreadable: () =>
      "Bu playlist şu an okunamadı. Gizli olabilir; 'Şarkılar' sekmesinden birkaç şarkı seçerek dene.",
    profileNotFound: () => "Bu Spotify profili bulunamadı. Linki kontrol et.",
    profileUnreadable: () => "Bu profil şu an okunamadı. Profilden bir playlist açıp onun linkini yapıştırmayı dene.",
    profileNoPlaylists: (p) => (p[0] ? `${p[0]} profilinde herkese açık playlist yok.` : "Bu profilde herkese açık playlist yok."),
    emptyPlaylist: () => "Bu playlist'te benzerini bulabileceğim şarkı yok.",
    seedCount: (p) => `1 ile ${p[0]} arasında şarkı seç.`,
    seedsInvalid: () => "Seçilen şarkılar geçersiz.",
    nameMissing: () => "Playlist'e bir isim ver.",
    saveListInvalid: () => "Kaydedilecek şarkı listesi geçersiz.",
    loginDenied: () => "Spotify izni verilmedi. Kaydetmek için tekrar bağlanabilirsin.",
    loginState: () => "Bağlantı yarıda kaldı. Tekrar bağlan.",
    loginFailed: () => "Spotify bağlantısı başarısız oldu. Tekrar dene.",
    loginRejected: () =>
      "Spotify bağlantısı reddedildi. Uygulama geliştirme modundayken sadece Spotify Dashboard → User Management'a eklenen hesaplar bağlanabilir.",
  },
};

export type Messages = typeof en;
export type ErrorCode = keyof Messages["errors"];
export const messages: Record<Lang, Messages> = { en, tr };

export function isErrorCode(code: unknown): code is ErrorCode {
  return typeof code === "string" && Object.hasOwn(en.errors, code);
}

/** Renders an error code from the API (or the client) in the given language. */
export function errorText(lang: Lang, code: unknown, params: ErrorParam[] = []): string {
  const errors = messages[lang].errors;
  // Every entry is a Msg; some just ignore their params.
  return isErrorCode(code) ? (errors[code] as Msg)(params) : errors.generic();
}
