import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL, PLACEHOLDER } from "@/lib/legal";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = {
  title: "Kullanım Koşulları — Echo List",
  description: "Echo List'i kullanma koşulları.",
};

export default function TermsPage() {
  const email = LEGAL.contactEmail;

  return (
    <LegalPage title="Kullanım Koşulları">
      <p>
        Echo List&apos;i kullanarak bu koşulları kabul etmiş olursunuz. Kabul etmiyorsanız lütfen siteyi kullanmayın.
      </p>

      <h2>Echo List nedir</h2>
      <p>
        Echo List, bir Spotify playlist&apos;ine veya seçtiğiniz şarkılara benzeyen şarkıları öneren ücretsiz bir web
        aracıdır. Benzerlik verisi Last.fm&apos;den, şarkı bilgileri Spotify&apos;dan gelir. Önerileri bağlantı olarak
        kopyalayabilir veya Spotify hesabınızı bağlayıp yeni bir playlist olarak kaydedebilirsiniz.
      </p>

      <h2>Spotify ve Last.fm ile ilişki</h2>
      <p>
        Echo List bağımsız bir projedir. Spotify AB veya Last.fm ile bağlantılı değildir; onlar tarafından desteklenmez,
        onaylanmaz veya sponsor edilmez. &quot;Spotify&quot; ve &quot;Last.fm&quot; ilgili şirketlerin ticari
        markalarıdır.
      </p>
      <p>
        Spotify hesabınızı bağladığınızda Spotify&apos;ı kullanmaya devam etmiş olursunuz. Bu nedenle{" "}
        <a href="https://www.spotify.com/legal/end-user-agreement/" target="_blank" rel="noreferrer">
          Spotify Kullanım Koşulları
        </a>{" "}
        da geçerlidir.
      </p>

      <h2>Kullanım kuralları</h2>
      <ul>
        <li>Siteyi kişisel ve ticari olmayan amaçlarla kullanabilirsiniz.</li>
        <li>
          Siteyi otomatik araçlarla toplu sorgulamak, istek sınırlarını aşmaya çalışmak veya hizmeti aksatacak şekilde
          kullanmak yasaktır.
        </li>
        <li>Öneri sonuçlarını toplu olarak toplayıp başka bir hizmette yeniden yayımlayamazsınız.</li>
      </ul>

      <h2>Hesabınız ve playlist&apos;leriniz</h2>
      <p>
        Echo List, Spotify hesabınızda yalnızca siz &quot;Spotify&apos;a kaydet&quot;e bastığınızda ve yalnızca yeni bir
        gizli playlist oluşturur. Oluşturulan playlist&apos;ler sizindir ve Spotify&apos;dan yönetebilirsiniz. Erişimi
        istediğiniz zaman kaldırabilirsiniz; nasıl yapılacağı{" "}
        <Link href="/gizlilik">Gizlilik Politikası</Link>&apos;nda anlatılır.
      </p>

      <h2>Garanti verilmez</h2>
      <p>
        Hizmet &quot;olduğu gibi&quot; ve &quot;mevcut olduğu sürece&quot; sunulur. Önerilerin doğruluğu, uygunluğu veya
        zevkinize uyacağı garanti edilmez. Hizmet Spotify ve Last.fm&apos;in sunduğu verilere ve erişime bağlıdır. Bu
        hizmetler değişirse Echo List&apos;in bazı özellikleri haber verilmeksizin çalışmayabilir veya kaldırılabilir.
      </p>

      <h2>Sorumluluğun sınırı</h2>
      <p>
        Yürürlükteki hukukun izin verdiği ölçüde, Echo List&apos;in kullanımından veya kullanılamamasından doğan dolaylı
        zararlardan sorumlu tutulamayız. Kasıt veya ağır ihmalden doğan sorumluluk bu sınırlamanın dışındadır.
      </p>

      <h2>Değişiklikler ve sonlandırma</h2>
      <p>
        Bu koşulları güncelleyebiliriz; güncel tarih sayfanın başında yer alır. Hizmeti dilediğimiz zaman değiştirebilir veya
        sonlandırabiliriz. Kurallara aykırı kullanım durumunda erişimi kısıtlayabiliriz.
      </p>

      <h2>Uygulanacak hukuk</h2>
      <p>Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir.</p>

      <h2>İletişim</h2>
      <p>Sorularınız için: {email ? <a href={`mailto:${email}`}>{email}</a> : PLACEHOLDER}.</p>
    </LegalPage>
  );
}
