
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import { getMovieById } from '@/lib/api';
import type { MovieDetail as MovieDetailType } from '@/lib/api';
import MovieMeta from '@/components/movies/MovieMeta';
import { useAdminSettings } from '@/hooks/useAdminSettings';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const { amazonAffiliateId } = useAdminSettings();

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await getMovieById(parseInt(id));
        setMovie(data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (isLoading || !movie) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center">
          <div className="animate-pulse text-white">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
  
  const getAmazonUrl = (title: string) => {
    const formattedTitle = encodeURIComponent(title);
    const tag = amazonAffiliateId || 'movieflair-21';
    return `https://www.amazon.de/gp/video/search?phrase=${formattedTitle}&tag=${tag}`;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#1A1F2C]">
        <div className="container-custom py-12">
          <div className="grid md:grid-cols-[350px,1fr] gap-8">
            {/* Poster */}
            <div>
              <div className="rounded-lg overflow-hidden">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full"
                  />
                ) : (
                  <div className="aspect-[2/3] bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-400">Kein Poster</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="text-white">
              <h1 className="text-4xl font-semibold mb-2">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-xl text-gray-400 mb-4 italic">
                  {movie.tagline}
                </p>
              )}

              <MovieMeta
                year={year?.toString()}
                rating={movie.vote_average}
                duration={movie.runtime}
              />

              <div className="flex flex-wrap gap-2 my-6">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-4 py-1 bg-blue-900/50 text-blue-100 rounded"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 mb-8 leading-relaxed">
                {movie.overview}
              </p>

              <div className="flex gap-4 mb-8">
                {movie.hasStream && (
                  <button
                    className="bg-[#0FA0CE] text-white px-6 py-2 rounded hover:bg-[#0FA0CE]/90 transition-colors"
                    onClick={() => setShowTrailer(true)}
                  >
                    Stream ansehen
                  </button>
                )}
                <a
                  href={getAmazonUrl(movie.title || '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00A8E1] text-white px-6 py-2 rounded hover:bg-[#00A8E1]/90 transition-colors flex items-center gap-2"
                >
                  <img 
                    src="/prime-video-icon.png" 
                    alt="Prime Video" 
                    className="w-5 h-5"
                  />
                  Bei Prime Video ansehen
                </a>
              </div>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="border-b border-gray-700 w-full justify-start h-auto p-0 bg-transparent">
                  <TabsTrigger 
                    value="details"
                    className="px-6 py-2 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cast"
                    className="px-6 py-2 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent"
                  >
                    Besetzung
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trailer"
                    className="px-6 py-2 text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent"
                  >
                    Trailer
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-6">
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 text-gray-300">
                    <div>
                      <h3 className="text-blue-400 mb-1">Regie</h3>
                      <p>Lee Unkrich</p>
                    </div>
                    <div>
                      <h3 className="text-blue-400 mb-1">Drehbuch</h3>
                      <p>Adrian Molina, Matthew Aldrich</p>
                    </div>
                    <div>
                      <h3 className="text-blue-400 mb-1">Produktionsland</h3>
                      <p>USA</p>
                    </div>
                    <div>
                      <h3 className="text-blue-400 mb-1">Sprache</h3>
                      <p>Englisch</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="cast" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movie.cast?.map((person) => (
                      <div key={person.id} className="text-center">
                        <div className="w-full aspect-[2/3] rounded-lg overflow-hidden mb-2">
                          {person.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <span className="text-gray-600">No Image</span>
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-white">{person.name}</h4>
                        <p className="text-xs text-gray-400">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="trailer" className="mt-6">
                  {movie.videos?.results.length ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={`https://www.youtube.com/embed/${movie.videos.results[0].key}`}
                        title="Movie Trailer"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <p className="text-gray-400">Kein Trailer verfügbar.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Modal */}
      {showTrailer && movie.streamUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-white/80"
            >
              Schließen
            </button>
            <div className="aspect-video">
              <iframe
                src={movie.streamUrl}
                title={`${movie.title} Stream`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default MovieDetails;
