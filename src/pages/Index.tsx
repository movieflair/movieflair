
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HomeFilterBox from '@/components/filter/HomeFilterBox';
import SEOHead from '@/components/seo/SEOHead';
import { getRandomCustomLists, CustomList } from '@/lib/api';
import CustomListCarousel from '@/components/movies/CustomListCarousel';

const Index = () => {
  const [customLists, setCustomLists] = useState<CustomList[]>([]);

  useEffect(() => {
    // Benutzerdefinierte Listen abrufen (auf 2 beschränkt für die Startseite)
    const lists = getRandomCustomLists(2);
    setCustomLists(lists);
  }, []);

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

      {/* Hero Section mit Logo */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <img
              src="/movieflair-logo.png"
              alt="MovieFlair M Logo"
              className="w-24 h-24 mx-auto mb-8"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 text-gray-900">
              Entdecke deine Filme
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6">
              Entdecke den perfekten Film für jeden Moment. Lass dich von deiner Stimmung leiten.
            </p>
          </div>
          <HomeFilterBox />
        </div>
      </section>

      {/* Custom Lists Section */}
      {customLists.length > 0 && (
        <section className="py-20">
          <div className="container-custom">
            <h2 className="text-2xl font-semibold mb-8">Unsere Empfehlungen</h2>
            {customLists.map(list => (
              <CustomListCarousel key={list.id} list={list} />
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  );
};

export default Index;
