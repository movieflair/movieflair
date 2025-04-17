
import { MovieDetail, CastMember } from "@/lib/types";
import { Seo } from "@/components/seo/Seo";
import MovieStructuredData from "@/components/movies/MovieStructuredData";
import { 
  formatMediaTitle, 
  formatMediaDescription, 
  getAbsoluteImageUrl,
  createCanonicalUrl
} from '@/utils/seoHelpers';

interface MovieSeoDataProps {
  movie: MovieDetail;
  director?: CastMember;
}

export const MovieSeoData = ({ movie, director }: MovieSeoDataProps) => {
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '';
  
  // Individueller SEO-Titel mit Filmname und Jahr
  const seoTitle = formatMediaTitle(movie.title, releaseYear);
  // Individuelle SEO-Beschreibung mit Übersicht des Films, beschränkt auf 160 Zeichen
  const seoDescription = formatMediaDescription(movie.title, releaseYear, movie.overview, 160);
  
  // Verwende TMDB-Bilder für OG-Image, aber bevorzuge lokale Bilder falls vorhanden
  const seoOgImage = movie.backdrop_path && movie.backdrop_path.startsWith('/storage') 
    ? getAbsoluteImageUrl(movie.backdrop_path)
    : getAbsoluteImageUrl(
        movie.backdrop_path 
          ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
          : '/movieflair-logo.png'
      );
  
  // Kanonische URL für diesen Film
  const seoPath = `/film/${movie.id}${movie.title ? `/${encodeURIComponent(movie.title.toLowerCase().replace(/\s+/g, '-'))}` : ''}`;
  const canonical = createCanonicalUrl(seoPath);

  console.log('Film SEO-Daten:', { 
    title: seoTitle,
    description: seoDescription,
    image: seoOgImage,
    canonical: canonical
  });

  return (
    <>
      <Seo 
        title={seoTitle}
        description={seoDescription}
        ogImage={seoOgImage}
        ogType="movie"
        canonical={canonical}
        keywords={`${movie.title}, ${movie.genres?.map(g => g.name).join(', ')}, Film Stream, Online anschauen, ${releaseYear}`}
      />
      <MovieStructuredData movie={movie} director={director} />
    </>
  );
};
