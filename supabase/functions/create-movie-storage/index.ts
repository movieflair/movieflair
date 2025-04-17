
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { movieId, imageUrl, imageType } = await req.json()
    
    if (!movieId || !imageUrl || !imageType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters', message: 'movieId, imageUrl, and imageType are required' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (imageType !== 'poster' && imageType !== 'backdrop') {
      return new Response(
        JSON.stringify({ error: 'Invalid imageType', message: 'imageType must be either "poster" or "backdrop"' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get environment variables for Supabase connection
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Configuration error', message: 'Missing required environment variables' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Create Supabase client with service role (admin) permissions
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    
    // Format the image URL
    let fullImageUrl = imageUrl;
    if (imageUrl.startsWith('/')) {
      fullImageUrl = `https://image.tmdb.org/t/p/original${imageUrl}`;
    }
    
    console.log(`Downloading ${imageType} from ${fullImageUrl}`);
    
    // Download the image from the URL
    const imageResponse = await fetch(fullImageUrl);
    
    if (!imageResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Error downloading image', message: `Failed to download image: ${imageResponse.status} ${imageResponse.statusText}` }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const imageBlob = await imageResponse.blob();
    const folderPath = imageType === 'poster' ? 'posters' : 'backdrops';
    const filePath = `${folderPath}/${movieId}.jpg`;
    
    console.log(`Uploading to movie_images/${filePath}`);
    
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return new Response(
        JSON.stringify({ error: 'Error listing buckets', message: listError.message }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'movie_images');
    
    if (!bucketExists) {
      console.log('movie_images bucket doesn\'t exist, creating it...');
      
      const { error: createError } = await supabase.storage.createBucket('movie_images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return new Response(
          JSON.stringify({ error: 'Error creating bucket', message: createError.message }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      console.log('movie_images bucket created successfully');
    }
    
    // Upload the image
    const { data, error } = await supabase.storage
      .from('movie_images')
      .upload(filePath, imageBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg'
      });
    
    if (error) {
      console.error(`Error uploading image:`, error);
      return new Response(
        JSON.stringify({ error: 'Error uploading image', message: error.message }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Get the public URL
    const publicUrl = `/storage/movie_images/${filePath}`;
    
    // Update the movie with the new path
    const updateField = imageType === 'poster' ? 'poster_path' : 'backdrop_path';
    const { error: updateError } = await supabase
      .from('admin_movies')
      .update({ [updateField]: publicUrl })
      .eq('id', movieId);
    
    if (updateError) {
      console.error('Error updating movie with new path:', updateError);
      // Continue anyway as the image was uploaded
    }
    
    console.log(`Image uploaded successfully to ${publicUrl}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        publicUrl,
        message: `Image uploaded successfully` 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in create-movie-storage function:', error);
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
