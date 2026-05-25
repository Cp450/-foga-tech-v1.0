import { Helmet } from "react-helmet-async";

export default function SEO({ title, description, canonical, ogImage, noindex = false }) {
  const fullTitle = title?.includes("Foga-Tech") ? title : `${title} — Foga-Tech BTP`;
  const defaultImage = "https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&w=1200";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={ogImage ?? defaultImage} />
      <meta property="og:type" content="website" />
      {canonical && <meta property="og:url" content={canonical} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage ?? defaultImage} />
    </Helmet>
  );
}
