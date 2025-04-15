
import { MovieDetail, CastMember } from '@/lib/types';

interface MovieStructuredDataProps {
  movie: MovieDetail;
  director?: CastMember;
}

const MovieStructuredData = ({ movie, director }: MovieStructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "description": movie.overview,
    "image": movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
    "datePublished": movie.release_date,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": String(movie.vote_average),
      "ratingCount": String(movie.vote_count || 0),
      "bestRating": "10",
      "worstRating": "0"
    },
    "director": director ? {
      "@type": "Person",
      "name": director.name
    } : undefined,
    "actor": movie.cast?.slice(0, 5).map(actor => ({
      "@type": "Person",
      "name": actor.name
    })),
    "genre": movie.genres?.map(genre => genre.name),
    "duration": movie.runtime ? `PT${movie.runtime}M` : undefined
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default MovieStructuredData;
