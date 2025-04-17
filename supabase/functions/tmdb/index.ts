
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { path = '', searchParams = {} } = await req.json()
    const apiKey = Deno.env.get('TMDB_API_KEY')
    
    if (!apiKey) {
      console.error('TMDB API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'API configuration error', message: 'TMDB API key not found' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Build the URL with search parameters
    const url = new URL(`https://api.themoviedb.org/3${path}`)
    url.searchParams.append('api_key', apiKey)
    
    // Add additional search parameters
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value))
      }
    })

    // Log the request (hiding the API key)
    const sanitizedUrl = url.toString().replace(apiKey, 'API_KEY_HIDDEN');
    console.log(`Fetching TMDB API: ${sanitizedUrl}`);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TMDB API responded with status ${response.status}: ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: 'TMDB API error', 
          status: response.status, 
          message: errorText 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: response.status 
        }
      );
    }
    
    const data = await response.json()
    
    // Log the response summary
    if (data.results) {
      console.log(`TMDB API response: ${data.results.length} results`);
    } else {
      console.log(`TMDB API response received (non-results format)`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in TMDB function:', error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        stack: error.stack 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
