
import { Helmet } from 'react-helmet-async';
import { DEFAULT_SEO } from '@/utils/seoHelpers';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'movie' | 'tv_show';
  canonical?: string;
  noindex?: boolean;
  structuredData?: Record<string, any>;
}

const SEOHead = ({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  ogImage = DEFAULT_SEO.ogImage,
  ogType = 'website',
  canonical,
  noindex = false,
  structuredData,
}: SEOHeadProps) => {
  // Get the current URL for canonical link if not provided
  const currentUrl = canonical || (typeof window !== 'undefined' ? window.location.href : '');
  
  // Ensure image URLs are absolute
  const absoluteOgImage = ogImage.startsWith('http') 
    ? ogImage 
    : ogImage.startsWith('/') && !ogImage.startsWith('//') 
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}${ogImage}` 
      : ogImage;
  
  console.log('SEOHead rendering with:', { 
    title, 
    description, 
    ogImage: absoluteOgImage, 
    currentUrl,
    ogType 
  });
  
  // Force a rebuild of the document head with Helmet
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Robots control */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={DEFAULT_SEO.siteName} />
      <meta property="og:locale" content="de_DE" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />
      
      {/* Structured Data / JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
