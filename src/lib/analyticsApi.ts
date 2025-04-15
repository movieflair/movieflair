
import { VisitorStat } from './types';

export const trackPageVisit = async (page: string) => {
  const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
  if (isAdmin) return;
  
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const visitsJson = localStorage.getItem('pageVisits');
    let visits: VisitorStat[] = [];
    
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

export const getVisitorStats = (): VisitorStat[] => {
  try {
    const visitsJson = localStorage.getItem('pageVisits');
    if (!visitsJson) return [];
    return JSON.parse(visitsJson);
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return [];
  }
};

