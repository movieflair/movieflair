
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * This component is a workaround since we can't modify App.tsx directly.
 * It will be added to MainLayout to allow search functionality through URL parameters
 * without having to add a new route to App.tsx.
 */
const SearchRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if the current URL contains a search parameter
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    
    // If there's a search parameter, redirect to the dedicated search page
    if (searchQuery && location.pathname !== '/search') {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }, [location, navigate]);
  
  return null; // This component doesn't render anything
};

export default SearchRedirect;
