
import MainLayout from '@/components/layout/MainLayout';
import HomeFilterBox from '@/components/filter/HomeFilterBox';
import FeaturedMovies from '@/components/movies/FeaturedMovies';

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section - Using a lighter, friendlier background */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 text-gray-900">
              Entdecke deine Filme
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-12">
              Entdecke den perfekten Film für jeden Moment. Lass dich von deiner Stimmung leiten.
            </p>
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
