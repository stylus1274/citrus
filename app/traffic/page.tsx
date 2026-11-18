import type { Metadata } from "next";
import Link from "next/link";
import { hasTrafficAccess } from "@/lib/traffic/auth";
import { ensureTrafficSchema, trafficDb } from "@/lib/traffic/db";
import { LoginForm, LogoutButton } from "./controls";
import styles from "./traffic.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Traffic Dashboard | Citrus Demolition & Land Clearing",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ days?: string; error?: string }> };

export default async function TrafficPage({ searchParams }: Props) {
  const { days: requestedDays, error } = await searchParams;
  const authenticated = await hasTrafficAccess();
  const is24Hours = requestedDays === "1";
  const days = [7, 30, 90].includes(Number(requestedDays)) ? Number(requestedDays) : 30;
  const hours = is24Hours ? 24 : days * 24;
  let summary = { views: 0, visits: 0 };
  let channels: { channel: string; visits: number }[] = [];
  let sources: { source: string; visits: number }[] = [];
  let pages: { path: string; views: number }[] = [];
  let daily: { day: string; views: number; visits: number }[] = [];
  let databaseError = false;

  if (authenticated) {
    try {
      await ensureTrafficSchema();
      const sql = trafficDb();
      const [totals, channelRows, sourceRows, pageRows, dayRows] = await Promise.all([
        sql`SELECT count(*)::int AS views, count(DISTINCT session_id)::int AS visits
          FROM traffic_pageviews WHERE viewed_at >= now() - (${hours}::int * interval '1 hour')`,
        sql`SELECT CASE WHEN channel = 'Organic search' AND source = 'ads.google.com' THEN 'Referral' ELSE channel END AS channel,
          count(DISTINCT session_id)::int AS visits FROM traffic_pageviews
          WHERE viewed_at >= now() - (${hours}::int * interval '1 hour') GROUP BY 1 ORDER BY visits DESC`,
        sql`SELECT source, count(DISTINCT session_id)::int AS visits FROM traffic_pageviews
          WHERE viewed_at >= now() - (${hours}::int * interval '1 hour') GROUP BY source ORDER BY visits DESC LIMIT 8`,
        sql`SELECT path, count(*)::int AS views FROM traffic_pageviews
          WHERE viewed_at >= now() - (${hours}::int * interval '1 hour') GROUP BY path ORDER BY views DESC LIMIT 10`,
        is24Hours ? sql`SELECT to_char(date_trunc('hour', viewed_at) AT TIME ZONE 'America/New_York', 'YYYY-MM-DD HH24:00') AS day,
          count(*)::int AS views, count(DISTINCT session_id)::int AS visits FROM traffic_pageviews
          WHERE viewed_at >= now() - interval '24 hours'
          GROUP BY date_trunc('hour', viewed_at) ORDER BY date_trunc('hour', viewed_at)` :
        sql`SELECT to_char(viewed_at AT TIME ZONE 'America/New_York', 'YYYY-MM-DD') AS day,
          count(*)::int AS views, count(DISTINCT session_id)::int AS visits FROM traffic_pageviews
          WHERE viewed_at >= now() - (${hours}::int * interval '1 hour')
          GROUP BY day ORDER BY day`,
      ]);
      summary = { views: Number(totals[0]?.views || 0), visits: Number(totals[0]?.visits || 0) };
      channels = channelRows.map((row) => ({ channel: String(row.channel), visits: Number(row.visits) }));
      sources = sourceRows.map((row) => ({ source: String(row.source), visits: Number(row.visits) }));
      pages = pageRows.map((row) => ({ path: String(row.path), views: Number(row.views) }));
      daily = dayRows.map((row) => ({ day: String(row.day), views: Number(row.views), visits: Number(row.visits) }));
    } catch (reason) {
      console.error("Traffic dashboard failed", reason);
      databaseError = true;
    }
  }

  const peak = Math.max(1, ...daily.map((row) => row.views));
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>CITRUS<span> / TRAFFIC</span></Link>
        {authenticated && <LogoutButton />}
      </header>
      {!authenticated ? (
        <main className={styles.loginWrap}>
          <div className={styles.loginCard}>
            <p className={styles.eyebrow}>Private dashboard</p>
            <h1>Site traffic</h1>
            <p>Sign in to see visits, traffic sources, and page views.</p>
            {error && <p className={styles.alert} role="alert">That sign-in link expired or could not be used. Request a new one.</p>}
            <LoginForm />
          </div>
        </main>
      ) : (
        <main className={styles.dashboard}>
          <div className={styles.heading}>
            <div><p className={styles.eyebrow}>Citrus Demolition & Land Clearing</p><h1>Traffic overview</h1><p>First-party website data. Updates as new page views arrive.</p></div>
            <nav className={styles.periods} aria-label="Date range">
              {[{ value: 1, label: "24 hours" }, { value: 7, label: "7 days" }, { value: 30, label: "30 days" }, { value: 90, label: "90 days" }].map((option) =>
                <Link key={option.value} href={`/traffic/?days=${option.value}`} aria-current={(is24Hours ? 1 : days) === option.value ? "page" : undefined}>{option.label}</Link>)}
            </nav>
          </div>
          {databaseError ? <p className={styles.alert} role="alert">Traffic data is temporarily unavailable. Please try again shortly.</p> : <>
            <section className={styles.metrics} aria-label="Traffic totals">
              <div><span>Visits</span><strong>{summary.visits.toLocaleString()}</strong><small>Distinct sessions</small></div>
              <div><span>Page views</span><strong>{summary.views.toLocaleString()}</strong><small>All pages viewed</small></div>
              <div><span>Pages per visit</span><strong>{summary.visits ? (summary.views / summary.visits).toFixed(1) : "0.0"}</strong><small>Average</small></div>
            </section>
            <section className={styles.panel}>
              <div className={styles.panelHeading}><h2>Page views over time</h2><span>{is24Hours ? "Hourly" : "Daily"} · Eastern time</span></div>
              {daily.length ? <div className={styles.chart} role="img" aria-label={`${is24Hours ? "Hourly" : "Daily"} page views chart`}>
                {daily.map((row, index) => <div key={`${row.day}-${index}`} className={styles.barWrap} title={`${row.day}: ${row.views} views, ${row.visits} visits`}>
                  <div className={styles.bar} style={{ height: `${Math.max(3, (row.views / peak) * 100)}%` }} />
                  <span>{is24Hours ? row.day.slice(11) : row.day.slice(5)}</span>
                </div>)}
              </div> : <p className={styles.empty}>No visits recorded yet. Tracking starts when this dashboard goes live.</p>}
            </section>
            <div className={styles.grid}>
              <section className={styles.panel}><h2>Traffic channels</h2><p className={styles.hint}>Visits by source type</p>
                {channels.length ? <div className={styles.rows}>{channels.map((row) => <div className={styles.row} key={row.channel}><span>{row.channel}</span><strong>{row.visits.toLocaleString()}</strong></div>)}</div> : <p className={styles.empty}>No data yet.</p>}
              </section>
              <section className={styles.panel}><h2>Top sources</h2><p className={styles.hint}>Visits by referrer or campaign source</p>
                {sources.length ? <div className={styles.rows}>{sources.map((row) => <div className={styles.row} key={row.source}><span>{row.source}</span><strong>{row.visits.toLocaleString()}</strong></div>)}</div> : <p className={styles.empty}>No data yet.</p>}
              </section>
            </div>
            <section className={styles.panel}><h2>Most viewed pages</h2><p className={styles.hint}>Page views in the selected period</p>
              {pages.length ? <div className={styles.rows}>{pages.map((row) => <div className={styles.row} key={row.path}><span>{row.path}</span><strong>{row.views.toLocaleString()}</strong></div>)}</div> : <p className={styles.empty}>No data yet.</p>}
            </section>
          </>}
          <p className={styles.note}>Visits are 30-minute sessions. Sources use landing page UTMs or referring domains. Automated browser traffic is excluded where identifiable.</p>
        </main>
      )}
    </div>
  );
}
