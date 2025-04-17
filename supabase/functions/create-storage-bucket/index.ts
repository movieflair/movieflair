
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bucketName = 'movie_images' } = await req.json()
    
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

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return new Response(
        JSON.stringify({ error: 'Error listing buckets', message: listError.message }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    
    if (!bucketExists) {
      console.log(`Creating ${bucketName} bucket...`);
      
      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      })
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return new Response(
          JSON.stringify({ error: 'Error creating bucket', message: createError.message }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Create folder structure with placeholder files
      try {
        await supabase.storage.from(bucketName).upload('posters/.gitkeep', new Blob(['']));
        await supabase.storage.from(bucketName).upload('backdrops/.gitkeep', new Blob(['']));
        console.log('Created folders within the bucket');
      } catch (folderError) {
        console.log('Could not create folders, but bucket exists:', folderError);
        // Continue anyway as the bucket was created
      }
      
      console.log(`${bucketName} bucket created successfully`);
      return new Response(
        JSON.stringify({ success: true, message: `${bucketName} bucket created successfully` }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      // Make sure the bucket is public
      console.log(`${bucketName} bucket already exists, ensuring it's public...`);
      
      try {
        // Get bucket details
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucketName);
        
        // If not public, update it
        if (bucketData && !bucketData.public) {
          const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
            public: true
          });
          
          if (updateError) {
            console.error('Error updating bucket visibility:', updateError);
          } else {
            console.log('Updated bucket to be public');
          }
        }
      } catch (error) {
        console.error('Error checking bucket visibility:', error);
      }
      
      return new Response(
        JSON.stringify({ success: true, message: `${bucketName} bucket already exists` }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error('Error in create-storage-bucket function:', error);
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
