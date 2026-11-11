import Script from "next/script";

/**
 * GA4, loaded with `lazyOnload` so it never competes with LCP (brief §2, §7).
 * Renders nothing until NEXT_PUBLIC_GA_ID is set at build time.
 * Consent Mode v2 defaults to "denied" for ad storage; the Google CMP (set up in AdSense)
 * updates consent for EEA/UK/CH visitors.
 */
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;
  return (
    <>
      <Script id="ga-consent" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted',wait_for_update:500});gtag('js',new Date());gtag('config','${id}');`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="lazyOnload" />
    </>
  );
}
