import type { Metadata } from "next";
import { LEGAL, PLACEHOLDER } from "@/lib/legal";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK — Echo List",
  description: "Echo List'in hangi verileri neden işlediği ve haklarınız.",
};

export default function PrivacyPage() {
  const name = LEGAL.controllerName || PLACEHOLDER;
  const email = LEGAL.contactEmail;

  return (
    <LegalPage title="Gizlilik Politikası ve KVKK Aydınlatma Metni">
      <p>
        Bu metin, Echo List&apos;i kullandığınızda hangi verilerin işlendiğini, neden işlendiğini ve 6698 sayılı Kişisel
        Verilerin Korunması Kanunu (KVKK) kapsamındaki haklarınızı açıklar. Kısaca: Echo List bir veritabanı tutmaz, reklam
        veya analiz aracı kullanmaz ve verilerinizi satmaz.
      </p>

      <h2>Veri sorumlusu</h2>
      <p>
        Veri sorumlusu: {name}. İletişim:{" "}
        {email ? <a href={`mailto:${email}`}>{email}</a> : PLACEHOLDER}.
      </p>

      <h2>Giriş yapmadan kullanırsanız</h2>
      <ul>
        <li>
          <strong>Aradığınız şarkılar ve yapıştırdığınız playlist ya da profil linki:</strong> benzer şarkıları bulmak
          için sunucumuz bunları Spotify&apos;a ve Last.fm&apos;e iletir. Profil linki verirseniz o profilin herkese açık
          playlist listesi Spotify&apos;dan okunur; bu bilgi saklanmaz. Last.fm&apos;e yalnızca şarkı ve sanatçı adları gider; sizi
          tanımlayan bir bilgi gönderilmez.
        </li>
        <li>
          <strong>IP adresiniz:</strong> kötüye kullanımı önlemek için kısa süreli bir istek sınırı uygularız. IP adresiniz bu
          amaçla yalnızca sunucu belleğinde tutulur, diske yazılmaz. 10 dakikadan eski kayıtlar dakikada bir temizlenir.
          Barındırma sağlayıcımız Vercel de standart sunucu kayıtları (IP adresi, tarayıcı bilgisi, istenen sayfa) tutar.
        </li>
        <li>
          <strong>Tarayıcınızda kalanlar:</strong> &quot;Bağlan ve Spotify&apos;a kaydet&quot;e bastığınızda, girişten
          döndüğünüzde kaybolmasın diye sonuç listesi tarayıcınızın oturum hafızasına (<code>sessionStorage</code>)
          yazılır. Geri döndüğünüzde okunur ve hemen silinir. Bu veri sunucumuza gönderilmez.
        </li>
      </ul>

      <h2>Spotify ile bağlanırsanız</h2>
      <p>Spotify girişinde aşağıdaki izinleri isteriz ve yalnızca belirtilen amaçla kullanırız:</p>
      <ul>
        <li>
          <strong>Temel profil</strong> (<code>user-read-private</code>): Spotify kullanıcı kimliğiniz ve görünen adınız.
          Sizi giriş yapmış göstermek ve hangi playlist&apos;lerin size ait olduğunu anlamak için kullanılır.
        </li>
        <li>
          <strong>Playlist&apos;lerinizi okuma</strong> (<code>playlist-read-private</code>,{" "}
          <code>playlist-read-collaborative</code>): playlist&apos;lerinizi listelemek ve seçtiğiniz playlist&apos;in
          şarkılarına bakmak için.
        </li>
        <li>
          <strong>Playlist oluşturma</strong> (<code>playlist-modify-private</code>, <code>playlist-modify-public</code>):
          yalnızca &quot;Spotify&apos;a kaydet&quot;e bastığınızda, seçtiğiniz şarkılarla hesabınızda yeni bir gizli
          playlist oluşturmak için. Mevcut playlist&apos;lerinizi değiştirmeyiz.
        </li>
      </ul>
      <p>
        Bu bilgiler ve Spotify erişim anahtarlarınız, tarayıcınızda tutulan şifreli bir oturum çerezinde (
        <code>ss_session</code>) saklanır. Sunucumuzda bir kullanıcı veritabanı yoktur. E-posta adresinizi istemez, size
        e-posta göndermeyiz.
      </p>

      <h2>Hangi hukuki sebeple işliyoruz</h2>
      <p>
        Verilerinizi, istediğiniz hizmeti sunabilmek için (KVKK m. 5/2-c, sözleşmenin kurulması ve ifası) ve hizmetin
        güvenliğini sağlamak için (KVKK m. 5/2-f, meşru menfaat) işleriz. Profil çıkarma, reklam veya pazarlama amacıyla
        işlemeyiz.
      </p>

      <h2>Kimlere aktarılıyor</h2>
      <ul>
        <li>
          <strong>Spotify</strong>: giriş, arama, playlist okuma ve kaydetme için. Spotify&apos;ın bu verileri nasıl işlediği{" "}
          <a href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noreferrer">
            Spotify Gizlilik Politikası
          </a>
          &apos;na tabidir.
        </li>
        <li>
          <strong>Last.fm</strong>: benzer şarkıları bulmak için şarkı ve sanatçı adları.
        </li>
        <li>
          <strong>Vercel</strong>: sitenin barındırılması ve sunucu kayıtları için.
        </li>
      </ul>
      <p>
        Bu hizmet sağlayıcıların sunucuları yurt dışındadır. Bu nedenle verileriniz, hizmetin sunulması için zorunlu olduğu
        ölçüde ve KVKK m. 9 kapsamında yurt dışına aktarılır. Verilerinizi bunların dışında kimseyle paylaşmayız ve
        satmayız.
      </p>

      <h2>Ne kadar süre saklanıyor</h2>
      <ul>
        <li>Oturum çerezi: en fazla 30 gün. &quot;Çıkış yap&quot;a bastığınızda hemen silinir.</li>
        <li>
          İstek sınırı için tutulan IP kayıtları: yalnızca sunucu belleğinde. 10 dakikadan eski kayıtlar dakikada bir
          temizlenir; sunucu yeniden başladığında hepsi silinir.
        </li>
        <li>
          Şarkı arama ve benzerlik sonuçlarının geçici önbelleği: yalnızca sunucu belleğinde, sunucu yeniden başladığında
          silinir. Bu önbellekte yalnızca şarkı ve sanatçı bilgisi vardır; sizi tanımlayan bir bilgi yoktur.
        </li>
        <li>Vercel sunucu kayıtları: Vercel&apos;in kendi saklama sürelerine tabidir.</li>
      </ul>

      <h2>Çerezler</h2>
      <p>
        Yalnızca bir çerez kullanırız: Spotify ile bağlandığınızda oturumunuzu tutan, hizmetin çalışması için zorunlu{" "}
        <code>ss_session</code> çerezi. Analiz, reklam veya takip çerezi kullanmayız.
      </p>

      <h2>Spotify bağlantısını kesmek ve verilerinizi silmek</h2>
      <ul>
        <li>
          Sitede &quot;Çıkış yap&quot;a basın. Oturum çereziniz ve içindeki tüm Spotify bilgileri silinir. Vercel&apos;in
          sunucu kayıtları dışında sunucumuzda sizinle ilgili kalıcı bir kayıt kalmaz.
        </li>
        <li>
          Echo List&apos;in Spotify hesabınıza erişimini tamamen kaldırmak için Spotify hesap sayfanızdaki{" "}
          <a href="https://www.spotify.com/account/apps/" target="_blank" rel="noreferrer">
            Uygulamalar
          </a>{" "}
          bölümünden Echo List&apos;in erişimini kaldırın.
        </li>
        <li>Echo List ile oluşturduğunuz playlist&apos;ler Spotify hesabınızdadır; istediğiniz zaman Spotify&apos;dan silebilirsiniz.</li>
      </ul>

      <h2>KVKK kapsamındaki haklarınız</h2>
      <p>KVKK m. 11 uyarınca şu haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenmek ve işlenmişse bilgi istemek,</li>
        <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenmek,</li>
        <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilmek,</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini istemek,</li>
        <li>KVKK m. 7 şartları çerçevesinde silinmesini veya yok edilmesini istemek,</li>
        <li>Düzeltme ve silme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini istemek,</li>
        <li>Otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etmek,</li>
        <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etmek.</li>
      </ul>
      <p>
        Bu haklarınızı kullanmak için bize{" "}
        {email ? <a href={`mailto:${email}`}>{email}</a> : `e-posta ile (adres ${PLACEHOLDER})`} yazabilirsiniz.
        Başvurunuzu en geç 30 gün içinde ücretsiz olarak yanıtlarız. Yanıtımızı yeterli bulmazsanız Kişisel Verileri Koruma
        Kurulu&apos;na şikâyette bulunabilirsiniz.
      </p>

      <h2>Değişiklikler</h2>
      <p>
        Bu metni güncellediğimizde yukarıdaki &quot;Son güncelleme&quot; tarihini değiştiririz. Önemli bir değişiklik olursa
        sitede ayrıca belirtiriz.
      </p>
    </LegalPage>
  );
}
