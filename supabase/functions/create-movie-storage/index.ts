
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Missing Supabase credentials' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { movie } = await req.json()
    
    if (!movie || !movie.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid movie data', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Check if the movie_images bucket exists
    const { data: buckets, error: getBucketsError } = await supabase
      .storage
      .listBuckets()
    
    if (getBucketsError) {
      console.error('Error listing buckets:', getBucketsError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to list buckets',
          details: getBucketsError.message,
          success: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    const movieImagesBucket = buckets.find(b => b.name === 'movie_images')
    
    if (!movieImagesBucket) {
      console.log('Creating movie_images bucket...')
      
      const { data: bucketData, error: createBucketError } = await supabase
        .storage
        .createBucket('movie_images', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024 // 5MB
        })
      
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create bucket',
            details: createBucketError.message,
            success: false
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      console.log('Bucket created:', bucketData)
    } else {
      console.log('movie_images bucket already exists')
    }
    
    // Try to download and store the movie images (poster and backdrop)
    let posterSaved = false
    let backdropSaved = false
    
    if (movie.poster_path && movie.poster_path.startsWith('/')) {
      try {
        console.log(`Downloading poster image for movie ${movie.id}`)
        const imageUrl = `https://image.tmdb.org/t/p/original${movie.poster_path}`
        const imageRes = await fetch(imageUrl)
        
        if (imageRes.ok) {
          const imageBlob = await imageRes.blob()
          const { data, error } = await supabase.storage
            .from('movie_images')
            .upload(`posters/${movie.id}.jpg`, imageBlob, {
              cacheControl: '3600',
              upsert: true
            })
            
          if (error) {
            console.error('Error uploading poster:', error)
          } else {
            console.log('Poster uploaded:', data)
            posterSaved = true
          }
        } else {
          console.error('Error downloading poster:', imageRes.statusText)
        }
      } catch (downloadError) {
        console.error('Error processing poster image:', downloadError)
      }
    }
    
    if (movie.backdrop_path && movie.backdrop_path.startsWith('/')) {
      try {
        console.log(`Downloading backdrop image for movie ${movie.id}`)
        const imageUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        const imageRes = await fetch(imageUrl)
        
        if (imageRes.ok) {
          const imageBlob = await imageRes.blob()
          const { data, error } = await supabase.storage
            .from('movie_images')
            .upload(`backdrops/${movie.id}.jpg`, imageBlob, {
              cacheControl: '3600',
              upsert: true
            })
            
          if (error) {
            console.error('Error uploading backdrop:', error)
          } else {
            console.log('Backdrop uploaded:', data)
            backdropSaved = true
          }
        } else {
          console.error('Error downloading backdrop:', imageRes.statusText)
        }
      } catch (downloadError) {
        console.error('Error processing backdrop image:', downloadError)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Movie storage prepared',
        details: {
          posterSaved,
          backdropSaved
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        success: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
