
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create the movie_images bucket if it doesn't already exist
    const { data: existingBuckets, error: bucketError } = await supabase
      .storage
      .listBuckets()

    if (bucketError) {
      console.error('Error checking existing buckets:', bucketError)
      throw new Error('Failed to check existing buckets')
    }

    const bucketExists = existingBuckets.some(bucket => bucket.name === 'movie_images')

    if (!bucketExists) {
      const { error: createError } = await supabase
        .storage
        .createBucket('movie_images', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        })

      if (createError) {
        console.error('Error creating bucket:', createError)
        throw new Error('Failed to create movie_images bucket')
      }

      // Create folders in the bucket
      const folders = ['posters', 'backdrops']
      
      for (const folder of folders) {
        // Create empty file to create the directory
        const { error: folderError } = await supabase
          .storage
          .from('movie_images')
          .upload(`${folder}/.keep`, new Uint8Array(0), {
            contentType: 'text/plain',
          })

        if (folderError && !folderError.message.includes('The resource already exists')) {
          console.error(`Error creating folder ${folder}:`, folderError)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Storage bucket movie_images created successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Storage bucket movie_images already exists'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
