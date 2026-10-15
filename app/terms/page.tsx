import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL, PLACEHOLDER } from "@/lib/legal";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = {
  title: "Terms — Echo List",
  description: "Terms of use for Echo List.",
  alternates: { languages: { en: "/terms", tr: "/kosullar" } },
};

// English counterpart of app/kosullar/page.tsx; keep the two in sync.
export default function TermsPage() {
  const email = LEGAL.contactEmail;

  return (
    <LegalPage lang="en" otherLangHref="/kosullar" title="Terms of Use">
      <p>By using Echo List you agree to these terms. If you don&apos;t agree, please don&apos;t use the site.</p>

      <h2>What Echo List is</h2>
      <p>
        Echo List is a free web tool that suggests songs similar to a Spotify playlist or to songs you pick. Similarity data
        comes from Last.fm and song information from Spotify. You can copy the suggestions as links, or connect your Spotify
        account and save them as a new playlist.
      </p>

      <h2>Relationship with Spotify and Last.fm</h2>
      <p>
        Echo List is an independent project. It is not affiliated with, endorsed, approved or sponsored by Spotify AB or
        Last.fm. &quot;Spotify&quot; and &quot;Last.fm&quot; are trademarks of their respective owners.
      </p>
      <p>
        When you connect your Spotify account you are still using Spotify, so the{" "}
        <a href="https://www.spotify.com/legal/end-user-agreement/" target="_blank" rel="noreferrer">
          Spotify Terms of Use
        </a>{" "}
        apply as well.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>You may use the site for personal, non-commercial purposes.</li>
        <li>
          Querying the site in bulk with automated tools, trying to get around its rate limits, or using it in a way that
          disrupts the service is not allowed.
        </li>
        <li>You may not collect suggestion results in bulk and republish them in another service.</li>
      </ul>

      <h2>Your account and playlists</h2>
      <p>
        Echo List creates a playlist in your Spotify account only when you press &quot;Save to Spotify&quot;, and only a new
        private one. The playlists it creates are yours to manage in Spotify. You can remove its access at any time; the{" "}
        <Link href="/privacy">Privacy Policy</Link> explains how.
      </p>

      <h2>No warranty</h2>
      <p>
        The service is provided &quot;as is&quot; and &quot;as available&quot;. We don&apos;t guarantee that suggestions are
        accurate, suitable or to your taste. The service depends on data and access provided by Spotify and Last.fm; if those
        change, some features may stop working or be removed without notice.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by applicable law, we are not liable for indirect damages arising from using, or being unable
        to use, Echo List. Liability for intent or gross negligence is not limited.
      </p>

      <h2>Changes and termination</h2>
      <p>
        We may update these terms; the current date is shown at the top of the page. We may change or end the service at any
        time, and may restrict access in case of use that breaks these terms.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the Republic of Turkey.</p>

      <h2>Contact</h2>
      <p>Questions: {email ? <a href={`mailto:${email}`}>{email}</a> : PLACEHOLDER.en}.</p>
    </LegalPage>
  );
}
