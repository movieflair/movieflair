
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Create a Supabase client with the admin role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    console.log('Checking if movie_images bucket exists...');
    
    // Check if the bucket already exists
    const { data: existingBuckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return new Response(JSON.stringify({ 
        error: 'Error listing buckets', 
        details: bucketsError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const bucketExists = existingBuckets?.some(bucket => bucket.name === 'movie_images');
    
    if (bucketExists) {
      console.log('movie_images bucket already exists');
      return new Response(JSON.stringify({ 
        message: 'Bucket already exists',
        bucketName: 'movie_images',
        status: 'success' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Create the bucket if it doesn't exist
    console.log('Creating movie_images bucket...');
    const { data: newBucket, error: createError } = await supabaseAdmin
      .storage
      .createBucket('movie_images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit in bytes
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      });
    
    if (createError) {
      console.error('Error creating bucket:', createError);
      return new Response(JSON.stringify({ 
        error: 'Error creating bucket', 
        details: createError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Create folders within the bucket
    console.log('Creating folders within the bucket...');
    
    // Helper function to create empty file in folder to establish folder structure
    const createFolderMarker = async (folderPath: string) => {
      const { error } = await supabaseAdmin
        .storage
        .from('movie_images')
        .upload(`${folderPath}/.folder`, new Blob([''], { type: 'text/plain' }));
      
      if (error) {
        console.error(`Error creating folder ${folderPath}:`, error);
      } else {
        console.log(`Created folder: ${folderPath}`);
      }
    };
    
    // Create folders for posters and backdrops
    await createFolderMarker('posters');
    await createFolderMarker('backdrops');
    
    return new Response(JSON.stringify({ 
      message: 'Bucket and folders created successfully',
      bucketName: 'movie_images',
      status: 'success' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Unexpected error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
