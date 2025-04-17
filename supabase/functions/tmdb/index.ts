
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { path = '', searchParams = {} } = await req.json()
    const apiKey = Deno.env.get('TMDB_API_KEY')
    
    if (!apiKey) {
      throw new Error('TMDB API key not found')
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

    console.log(`Fetching TMDB API: ${url.toString().replace(apiKey, 'API_KEY_HIDDEN')}`);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TMDB API responded with status ${response.status}: ${errorText}`);
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json()
    console.log(`TMDB API response: ${data.results ? data.results.length : 0} results`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in TMDB function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
