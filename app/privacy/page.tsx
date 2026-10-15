import type { Metadata } from "next";
import { LEGAL, PLACEHOLDER } from "@/lib/legal";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = {
  title: "Privacy — Echo List",
  description: "What data Echo List processes, why, and your rights.",
  alternates: { languages: { en: "/privacy", tr: "/gizlilik" } },
};

// English counterpart of app/gizlilik/page.tsx; keep the two in sync.
export default function PrivacyPage() {
  const name = LEGAL.controllerName || PLACEHOLDER.en;
  const email = LEGAL.contactEmail;

  return (
    <LegalPage lang="en" otherLangHref="/gizlilik" title="Privacy Policy">
      <p>
        This policy explains what data is processed when you use Echo List, why it is processed, and your rights, including
        those under Turkey&apos;s Personal Data Protection Law No. 6698 (KVKK). In short: Echo List keeps no database, uses no
        advertising or analytics tools, and does not sell your data.
      </p>

      <h2>Data controller</h2>
      <p>
        Data controller: {name}. Contact: {email ? <a href={`mailto:${email}`}>{email}</a> : PLACEHOLDER.en}.
      </p>

      <h2>If you use it without signing in</h2>
      <ul>
        <li>
          <strong>The songs you search for and the playlist or profile link you paste:</strong> our server sends these to
          Spotify and Last.fm to find similar songs. If you paste a profile link, that profile&apos;s list of public playlists
          is read from Spotify; it is not stored. Only song titles and artist names go to Last.fm; nothing that identifies you
          is sent.
        </li>
        <li>
          <strong>Your IP address:</strong> we apply a short rate limit to prevent abuse. For this, your IP address is kept
          only in server memory and is never written to disk. Entries older than 10 minutes are cleared every minute. Our
          hosting provider, Vercel, also keeps standard server logs (IP address, browser details, requested page).
        </li>
        <li>
          <strong>What stays in your browser:</strong> when you press &quot;Connect and save to Spotify&quot;, the result
          list is written to your browser&apos;s session storage (<code>sessionStorage</code>) so it isn&apos;t lost while
          you sign in. It is read and deleted as soon as you return, and it is never sent to our server.
        </li>
      </ul>

      <h2>If you connect Spotify</h2>
      <p>We ask for the following permissions when you connect Spotify and use them only for the stated purpose:</p>
      <ul>
        <li>
          <strong>Basic profile</strong> (<code>user-read-private</code>): your Spotify user ID and display name, used to
          show that you are signed in and to tell which playlists are yours.
        </li>
        <li>
          <strong>Reading your playlists</strong> (<code>playlist-read-private</code>,{" "}
          <code>playlist-read-collaborative</code>): to list your playlists and read the songs of the one you pick.
        </li>
        <li>
          <strong>Creating playlists</strong> (<code>playlist-modify-private</code>, <code>playlist-modify-public</code>):
          only when you press &quot;Save to Spotify&quot;, to create a new private playlist with the songs you kept. We never
          change your existing playlists.
        </li>
      </ul>
      <p>
        This information and your Spotify access tokens are stored in an encrypted session cookie (<code>ss_session</code>)
        kept in your browser. There is no user database on our server. We don&apos;t ask for your email address and never
        email you.
      </p>

      <h2>Legal basis</h2>
      <p>
        We process your data to provide the service you ask for (KVKK art. 5/2-c, performance of a contract) and to keep the
        service secure (KVKK art. 5/2-f, legitimate interest). We do not use it for profiling, advertising or marketing.
      </p>

      <h2>Who receives it</h2>
      <ul>
        <li>
          <strong>Spotify</strong>: for sign-in, search, reading playlists and saving. How Spotify processes this data is
          governed by the{" "}
          <a href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noreferrer">
            Spotify Privacy Policy
          </a>
          .
        </li>
        <li>
          <strong>Last.fm</strong>: song titles and artist names, to find similar songs.
        </li>
        <li>
          <strong>Vercel</strong>: hosting and server logs.
        </li>
      </ul>
      <p>
        These providers&apos; servers are outside Turkey, so your data is transferred abroad to the extent necessary to
        provide the service, under KVKK art. 9. We share it with no one else and never sell it.
      </p>

      <h2>How long it is kept</h2>
      <ul>
        <li>Session cookie: up to 30 days. It is deleted immediately when you press &quot;Log out&quot;.</li>
        <li>
          IP entries for rate limiting: server memory only. Entries older than 10 minutes are cleared every minute, and all of
          them are gone when the server restarts.
        </li>
        <li>
          Temporary cache of song searches and similarity results: server memory only, cleared when the server restarts. It
          holds only song and artist information, nothing that identifies you.
        </li>
        <li>Vercel server logs: subject to Vercel&apos;s own retention periods.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use one cookie: <code>ss_session</code>, which keeps you signed in after you connect Spotify and is required for
        the service to work. We use no analytics, advertising or tracking cookies.
      </p>

      <h2>Disconnecting Spotify and deleting your data</h2>
      <ul>
        <li>
          Press &quot;Log out&quot; on the site. Your session cookie and all the Spotify information in it are deleted. Apart
          from Vercel&apos;s server logs, nothing about you remains on our side.
        </li>
        <li>
          To remove Echo List&apos;s access to your Spotify account entirely, remove it under{" "}
          <a href="https://www.spotify.com/account/apps/" target="_blank" rel="noreferrer">
            Apps
          </a>{" "}
          on your Spotify account page.
        </li>
        <li>Playlists you created with Echo List live in your Spotify account; you can delete them in Spotify at any time.</li>
      </ul>

      <h2>Your rights under KVKK</h2>
      <p>Under KVKK art. 11 you have the right to:</p>
      <ul>
        <li>learn whether your personal data is processed and, if so, request information about it;</li>
        <li>learn the purpose of the processing and whether the data is used accordingly;</li>
        <li>know the third parties in Turkey or abroad to whom it is transferred;</li>
        <li>ask for it to be corrected if it is incomplete or inaccurate;</li>
        <li>ask for it to be deleted or destroyed under the conditions of KVKK art. 7;</li>
        <li>ask for corrections and deletions to be notified to the third parties it was transferred to;</li>
        <li>object to an outcome against you that results solely from automated analysis;</li>
        <li>claim compensation if you suffer damage from unlawful processing.</li>
      </ul>
      <p>
        To use these rights, write to us{" "}
        {email ? (
          <>
            at <a href={`mailto:${email}`}>{email}</a>
          </>
        ) : (
          `by email (address ${PLACEHOLDER.en})`
        )}
        . We answer free of charge within 30 days at the latest. If you are not satisfied with our answer, you can file a
        complaint with the Turkish Personal Data Protection Board (KVKK Kurulu).
      </p>

      <h2>Changes</h2>
      <p>
        When we update this policy we change the &quot;Last updated&quot; date above. If a change is significant, we will
        also point it out on the site.
      </p>
    </LegalPage>
  );
}
