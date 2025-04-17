
import { MovieDetail, CastMember } from "@/lib/types";
import { Seo } from "@/components/seo/Seo";
import TvShowStructuredData from "@/components/seo/TvShowStructuredData";
import { 
  formatMediaTitle, 
  formatMediaDescription, 
  getAbsoluteImageUrl,
  createCanonicalUrl
} from '@/utils/seoHelpers';

interface TvShowSeoDataProps {
  show: MovieDetail;
  director?: CastMember;
}

export const TvShowSeoData = ({ show, director }: TvShowSeoDataProps) => {
  const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear().toString() : '';
  
  const seoTitle = formatMediaTitle(show.name || '', firstAirYear);
  const seoDescription = formatMediaDescription(show.name || '', firstAirYear, show.overview, 160);
  
  const seoOgImage = show.backdrop_path && show.backdrop_path.startsWith('/storage') 
    ? getAbsoluteImageUrl(show.backdrop_path)
    : getAbsoluteImageUrl(
        show.backdrop_path 
          ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` 
          : '/movieflair-logo.png'
      );
  
  const seoPath = `/serie/${show.id}${show.name ? `/${encodeURIComponent(show.name.toLowerCase().replace(/\s+/g, '-'))}` : ''}`;
  const canonical = createCanonicalUrl(seoPath);

  console.log('TV Show SEO data:', { 
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
        ogType="tv_show"
        canonical={canonical}
        keywords={`${show.name}, ${show.genres?.map(g => g.name).join(', ')}, Serie Stream, Online anschauen, ${firstAirYear}`}
      />
      <TvShowStructuredData show={show} director={director} />
    </>
  );
};
