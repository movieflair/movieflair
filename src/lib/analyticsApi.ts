
import { supabase } from '@/integrations/supabase/client';

type InteractionType = 
  | 'prime_video_click'
  | 'trailer_click'
  | 'free_movie_click'
  | 'amazon_ad_click'
  | 'page_visit';

interface TrackOptions {
  mediaId?: number;
  mediaType?: 'movie' | 'tv';
}

export const trackInteraction = async (type: InteractionType, options: TrackOptions = {}) => {
  try {
    // Don't track if user is admin
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (isAdmin) return;

    const { data: { country } } = await fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .catch(() => ({ data: { country: null } }));

    await supabase.from('interaction_stats').insert({
      interaction_type: type,
      media_id: options.mediaId,
      media_type: options.mediaType,
      referrer: document.referrer || null,
      country,
      is_admin: isAdmin
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
};

// For backward compatibility with existing code
export const trackPageVisit = (page: string) => {
  const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
  if (isAdmin) return;
  
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const visitsJson = localStorage.getItem('pageVisits');
    let visits = [];
    
    if (visitsJson) {
      visits = JSON.parse(visitsJson);
    }
    
    const existingIndex = visits.findIndex(v => v.date === today && v.page === page);
    
    if (existingIndex >= 0) {
      visits[existingIndex].count += 1;
    } else {
      visits.push({ date: today, count: 1, page });
    }
    
    localStorage.setItem('pageVisits', JSON.stringify(visits));
  } catch (error) {
    console.error('Error tracking page visit:', error);
  }
};
