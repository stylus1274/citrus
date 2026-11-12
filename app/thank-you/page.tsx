import type { Metadata } from "next";
import Link from "next/link";
import styles from "./thank-you.module.css";

export const metadata: Metadata = {
  title: "Thank You | Citrus Demolition & Land Clearing",
  description: "Your estimate request has been received by Citrus Demolition & Land Clearing.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="Citrus Demolition and Land Clearing home">
          {/* The logo is a static asset published by the site's build script. */}
          <img
            className={styles.logo}
            src="/_site-assets/f09e534a354a771e9e73.webp"
            alt="Citrus Demolition & Land Clearing"
            width="210"
            height="58"
          />
        </Link>
        <a className={styles.headerCall} href="tel:+13524645955">
          Call 352-464-5955 <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main className={styles.main}>
        <div className={styles.inner}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Free estimate request</p>
            <h1>
              Thank you.<br />
              <span>We got it.</span>
            </h1>
            <p className={styles.lead}>
              Your project details have been sent to the Citrus Demolition & Land Clearing team.
              We’ll review your request and follow up to discuss the property and next steps.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primary} href="/">
                Back to home <span aria-hidden="true">↗</span>
              </Link>
              <a className={styles.secondary} href="tel:+13524645955">
                Need to talk now? Call us <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <aside className={styles.next} aria-label="What happens next">
            <p className={styles.nextEyebrow}>What happens next</p>
            <ol>
              <li><strong>We review the details.</strong><span>We look at the service, location, and scope you shared.</span></li>
              <li><strong>We get in touch.</strong><span>Our team follows up to clarify the work and discuss a site visit if needed.</span></li>
              <li><strong>You get a clear plan.</strong><span>We define the scope and provide an estimate based on the property.</span></li>
            </ol>
          </aside>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>© 2026 Citrus Demolition & Land Clearing</span>
        <span>Licensed · Bonded · Insured · CBC1264327</span>
      </footer>
    </div>
  );
}
