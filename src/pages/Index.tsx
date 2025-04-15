
import MainLayout from '@/components/layout/MainLayout';
import HomeFilterBox from '@/components/filter/HomeFilterBox';
import FeaturedMovies from '@/components/movies/FeaturedMovies';
import SearchBox from '@/components/search/SearchBox';
import SEOHead from '@/components/seo/SEOHead';

const Index = () => {
  // Prepare structured data for the homepage
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ScreenPick - Dein Filmguide",
    "url": "https://screenspick.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://screenspick.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <MainLayout>
      <SEOHead
        title="ScreenPick - Dein Filmguide"
        description="Entdecke den perfekten Film für jeden Moment. Lass dich von deiner Stimmung leiten und finde passende Film- und Serienempfehlungen."
        keywords="filme, serien, streaming, filmempfehlungen, filmtipps, filmguide, filmdatenbank"
        ogType="website"
        structuredData={websiteStructuredData}
      />

      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 text-gray-900">
              Entdecke deine Filme
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-12">
              Entdecke den perfekten Film für jeden Moment. Lass dich von deiner Stimmung leiten.
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBox variant="page" />
            </div>
          </div>
          <HomeFilterBox />
        </div>
      </section>

      {/* Featured Movies Section */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-2xl font-semibold mb-8">Unsere Empfehlungen</h2>
          <FeaturedMovies />
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
