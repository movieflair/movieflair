
import { Helmet } from "react-helmet-async";

type SeoProps = {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  canonical?: string;
  structuredData?: Record<string, any>;
};

export const Seo = ({ 
  title, 
  description, 
  ogImage, 
  ogType = "website",
  keywords,
  canonical,
  structuredData
}: SeoProps) => {
  const defaultTitle = "MovieFlair – Finde den perfekten Film für deine Stimmung";
  const defaultDescription = "Jeder Moment hat seinen Film. MovieFlair zeigt dir Filme, die zu deiner Stimmung passen – persönlich, emotional und genau im richtigen Moment.";
  const finalDescription = description?.slice(0, 140) || defaultDescription;

  return (
    <Helmet>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="author" content="movieflair" />
      <meta name="robots" content="index, follow" />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={finalDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default Seo;
