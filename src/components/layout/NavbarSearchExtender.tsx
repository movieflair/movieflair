
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import SearchBox from '@/components/search/SearchBox';

/**
 * This component will extend the Navbar with search functionality.
 * It will be added to MainLayout.
 */
const NavbarSearchExtender = () => {
  const navbarRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const isTrailersPage = location.pathname === '/trailers';
  
  useEffect(() => {
    if (isTrailersPage) return; // Don't add search on trailers page
    
    // Find the navbar element
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbarRef.current = navbar;
      
      // Find the existing navigation links container
      const navLinksContainer = navbar.querySelector('div.items-center');
      
      if (navLinksContainer) {
        // Create a container for our search box
        const searchContainer = document.createElement('div');
        searchContainer.id = 'navbar-search-container';
        searchContainer.className = 'ml-4';
        
        // Insert the container before the last child (which is usually the right side menu items)
        navLinksContainer.insertBefore(searchContainer, navLinksContainer.lastChild);
        
        // Render our SearchBox into this container
        const root = document.createElement('div');
        searchContainer.appendChild(root);
        
        // We would render React component here if possible
        // For now, we'll create a simple search form
        root.innerHTML = `
          <form action="/search" class="relative hidden md:block">
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="Filme & Serien suchen..."
                class="pl-10 pr-4 py-2 w-64 bg-gray-100 rounded-md border border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 transition-colors"
              />
            </div>
          </form>
        `;
      }
    }
    
    // Cleanup function
    return () => {
      const searchContainer = document.getElementById('navbar-search-container');
      if (searchContainer) {
        searchContainer.remove();
      }
    };
  }, [isTrailersPage]);
  
  return null; // This component doesn't render anything
};

export default NavbarSearchExtender;
