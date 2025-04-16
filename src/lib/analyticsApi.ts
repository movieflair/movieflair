import { supabase } from '@/integrations/supabase/client';

type InteractionType = 
  | 'prime_video_click'
  | 'trailer_click'
  | 'free_movie_click'
  | 'amazon_ad_click'
  | 'page_visit'
  | 'trailer_view';

interface TrackOptions {
  mediaId?: number;
  mediaType?: 'movie' | 'tv';
}

export interface VisitorStat {
  date: string;
  count: number;
  page: string;
}

export interface StatTimeRange {
  from: Date;
  to: Date;
  label: 'today' | 'yesterday' | '7days' | '30days' | 'year' | 'custom';
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

// Function to get visitor stats from localStorage
export const getVisitorStats = (): VisitorStat[] => {
  try {
    const visitsJson = localStorage.getItem('pageVisits');
    if (!visitsJson) return [];
    
    const visits = JSON.parse(visitsJson);
    return visits;
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return [];
  }
};

// Get predefined time ranges for filtering
export const getTimeRange = (rangeType: string): StatTimeRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  switch (rangeType) {
    case 'today':
      return { from: today, to: now, label: 'today' };
    case 'yesterday': {
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      return { from: yesterday, to: endOfYesterday, label: 'yesterday' };
    }
    case '7days': {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return { from: sevenDaysAgo, to: now, label: '7days' };
    }
    case '30days': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return { from: thirtyDaysAgo, to: now, label: '30days' };
    }
    case 'year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return { from: startOfYear, to: now, label: 'year' };
    }
    default:
      // Default to last 7 days
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return { from: sevenDaysAgo, to: now, label: '7days' };
  }
};

// Format date for SQL queries
export const formatDateForDB = (date: Date): string => {
  return date.toISOString();
};
