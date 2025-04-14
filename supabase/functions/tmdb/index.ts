
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface TMDBResponse {
  results: any[];
}

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
      url.searchParams.append(key, String(value))
    })

    const response = await fetch(url.toString())
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
