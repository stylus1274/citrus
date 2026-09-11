import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/design.html", destination: "/", permanent: true },
      { source: "/hernando-residential-demolition", destination: "/hernando/residential-demolition", permanent: true },
      { source: "/inverness-commercial-demolition", destination: "/inverness/commercial-demolition", permanent: true },
      { source: "/inverness-demolition", destination: "/inverness/demolition", permanent: true },
      { source: "/inverness-land-clearing", destination: "/inverness/land-clearing", permanent: true },
      { source: "/inverness-residential-demolition", destination: "/inverness/residential-demolition", permanent: true },
      { source: "/inverness-site-preparation", destination: "/inverness/site-prep", permanent: true },
      { source: "/spring-hill-land-clearing", destination: "/spring-hill/land-clearing", permanent: true },
      ...["5-signs-you-need-a-licensed-demolition-contractor", "a-comprehensive-guide-to-residential-demolition-services", "blog", "brooksville", "choosing-the-right-demolition-contractor", "commercial-demolition", "concrete-foundation-removal", "contact", "crystal-river-debris-removal-after-demolition", "debris-removal-hauling", "demolition-excavation-services-citrus-county-fl", "demolition-permits-citrus-county-fl", "emergency-demolition-crystal-river", "emergency-demolition", "hernando-residential-demolition", "hernando", "house-demolition-cost", "how-long-does-it-take-to-demolish-a-house-in-crystal-river-fl", "inverness-commercial-demolition", "inverness-demolition", "inverness-land-clearing", "inverness-residential-demolition", "inverness-site-preparation", "inverness", "land-clearing", "mobile-home-demolition", "mobile-home-demolition-services-citrus-county", "mobile-home-demolition-vs-removal-central-florida", "pool-removal", "projects", "residential-contractor-florida", "residential-demolition", "selective-demolition", "site-preparation-services-crystal-river-fl", "site-preparation", "spring-hill-land-clearing", "spring-hill", "understanding-hidden-costs-residential-demolition", "who-removes-old-mobile-homes-crystal-river-fl", "why-citrus"].map((slug) => ({ source: `/${slug}.html`, destination: `/${slug}`, permanent: true })),
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/_site/index.html" },
        { source: "/5-signs-you-need-a-licensed-demolition-contractor", destination: "/_site/5-signs-you-need-a-licensed-demolition-contractor.html" },
        { source: "/a-comprehensive-guide-to-residential-demolition-services", destination: "/_site/a-comprehensive-guide-to-residential-demolition-services.html" },
        { source: "/blog", destination: "/_site/blog.html" },
        { source: "/brooksville", destination: "/_site/brooksville.html" },
        { source: "/choosing-the-right-demolition-contractor", destination: "/_site/choosing-the-right-demolition-contractor.html" },
        { source: "/commercial-demolition", destination: "/_site/commercial-demolition.html" },
        { source: "/concrete-foundation-removal", destination: "/_site/concrete-foundation-removal.html" },
        { source: "/contact", destination: "/_site/contact.html" },
        { source: "/crystal-river-debris-removal-after-demolition", destination: "/_site/crystal-river-debris-removal-after-demolition.html" },
        { source: "/debris-removal-hauling", destination: "/_site/debris-removal-hauling.html" },
        { source: "/demolition-permits-citrus-county-fl", destination: "/_site/demolition-permits-citrus-county-fl.html" },
        { source: "/demolition-excavation-services-citrus-county-fl", destination: "/_site/demolition-excavation-services-citrus-county-fl.html" },
        { source: "/emergency-demolition", destination: "/_site/emergency-demolition.html" },
        { source: "/emergency-demolition-crystal-river", destination: "/_site/emergency-demolition-crystal-river.html" },
        { source: "/hernando/residential-demolition", destination: "/_site/hernando-residential-demolition.html" },
        { source: "/hernando", destination: "/_site/hernando.html" },
        { source: "/house-demolition-cost", destination: "/_site/house-demolition-cost.html" },
        { source: "/how-long-does-it-take-to-demolish-a-house-in-crystal-river-fl", destination: "/_site/how-long-does-it-take-to-demolish-a-house-in-crystal-river-fl.html" },
        { source: "/inverness/commercial-demolition", destination: "/_site/inverness-commercial-demolition.html" },
        { source: "/inverness/demolition", destination: "/_site/inverness-demolition.html" },
        { source: "/inverness/land-clearing", destination: "/_site/inverness-land-clearing.html" },
        { source: "/inverness/residential-demolition", destination: "/_site/inverness-residential-demolition.html" },
        { source: "/inverness/site-prep", destination: "/_site/inverness-site-preparation.html" },
        { source: "/inverness", destination: "/_site/inverness.html" },
        { source: "/land-clearing", destination: "/_site/land-clearing.html" },
        { source: "/mobile-home-demolition", destination: "/_site/mobile-home-demolition.html" },
        { source: "/mobile-home-demolition-services-citrus-county", destination: "/_site/mobile-home-demolition-services-citrus-county.html" },
        { source: "/mobile-home-demolition-vs-removal-central-florida", destination: "/_site/mobile-home-demolition-vs-removal-central-florida.html" },
        { source: "/pool-removal", destination: "/_site/pool-removal.html" },
        { source: "/projects", destination: "/_site/projects.html" },
        { source: "/residential-contractor-florida", destination: "/_site/residential-contractor-florida.html" },
        { source: "/residential-demolition", destination: "/_site/residential-demolition.html" },
        { source: "/selective-demolition", destination: "/_site/selective-demolition.html" },
        { source: "/site-preparation-services-crystal-river-fl", destination: "/_site/site-preparation-services-crystal-river-fl.html" },
        { source: "/site-preparation", destination: "/_site/site-preparation.html" },
        { source: "/spring-hill/land-clearing", destination: "/_site/spring-hill-land-clearing.html" },
        { source: "/spring-hill", destination: "/_site/spring-hill.html" },
        { source: "/understanding-hidden-costs-residential-demolition", destination: "/_site/understanding-hidden-costs-residential-demolition.html" },
        { source: "/who-removes-old-mobile-homes-crystal-river-fl", destination: "/_site/who-removes-old-mobile-homes-crystal-river-fl.html" },
        { source: "/why-citrus", destination: "/_site/why-citrus.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
