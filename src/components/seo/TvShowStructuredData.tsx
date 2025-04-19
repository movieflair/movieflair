
import { MovieDetail, CastMember } from '@/lib/types';

interface TvShowStructuredDataProps {
  show: MovieDetail;
  director?: CastMember;
}

const TvShowStructuredData = ({ show, director }: TvShowStructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": show.name || '',
    "description": show.overview || '',
    "image": show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
    "datePublished": show.first_air_date || '',
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": String(show.vote_average || 0),
      "ratingCount": String(show.vote_count || 0),
      "bestRating": "10",
      "worstRating": "0"
    },
    "director": director ? {
      "@type": "Person",
      "name": director.name
    } : undefined,
    "actor": show.cast?.slice(0, 5).map(actor => ({
      "@type": "Person",
      "name": actor.name
    })) || [],
    "genre": show.genres?.map(genre => genre.name) || [],
    "numberOfEpisodes": show.number_of_episodes || 0,
    "numberOfSeasons": show.number_of_seasons || 0,
    "sameAs": [
      show.external_ids?.imdb_id ? `https://www.imdb.com/title/${show.external_ids.imdb_id}/` : undefined,
      `https://www.themoviedb.org/tv/${show.id}`
    ].filter(Boolean)
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default TvShowStructuredData;
