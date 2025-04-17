
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, searchQuery, movieId, page = 1 } = await req.json()
    const apiKey = Deno.env.get('TMDB_API_KEY')
    
    if (!apiKey) {
      console.error('TMDB API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    let url: URL
    
    switch (action) {
      case 'search':
        url = new URL('https://api.themoviedb.org/3/search/movie')
        url.searchParams.append('api_key', apiKey)
        url.searchParams.append('query', searchQuery)
        url.searchParams.append('language', 'de-DE')
        url.searchParams.append('page', page.toString())
        break
        
      case 'getById':
        url = new URL(`https://api.themoviedb.org/3/movie/${movieId}`)
        url.searchParams.append('api_key', apiKey)
        url.searchParams.append('language', 'de-DE')
        url.searchParams.append('append_to_response', 'videos,credits')
        break
        
      case 'getPopular':
        url = new URL('https://api.themoviedb.org/3/movie/popular')
        url.searchParams.append('api_key', apiKey)
        url.searchParams.append('language', 'de-DE')
        url.searchParams.append('page', page.toString())
        break
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    // Log the request (hiding the API key)
    const sanitizedUrl = url.toString().replace(apiKey, 'API_KEY_HIDDEN');
    console.log(`TMDB API request: ${sanitizedUrl}`);

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: 'TMDB API error', 
          status: response.status,
          message: response.statusText 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }
    
    const data = await response.json()
    
    console.log(`TMDB API response received successfully for action: ${action}`);
    
    return new Response(
      JSON.stringify(data), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in TMDB function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        stack: error.stack 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
