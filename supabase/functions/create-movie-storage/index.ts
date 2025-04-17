
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const bucketName = 'movie_images';
    console.log(`Setting up movie images storage: ${bucketName}`);

    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw new Error(`Error listing buckets: ${listError.message}`);
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket '${bucketName}'...`);
      
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,  // Make bucket publicly accessible
        fileSizeLimit: 26214400, // 25MB in bytes
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      if (error) {
        console.error(`Error creating bucket '${bucketName}':`, error);
        throw new Error(`Error creating bucket: ${error.message}`);
      }
      
      // Create the folder structure
      const foldersToCreate = ['posters', 'backdrops'];
      
      for (const folder of foldersToCreate) {
        try {
          // Create an empty file to represent the folder
          const { error: folderError } = await supabase.storage
            .from(bucketName)
            .upload(`${folder}/.keep`, new Blob(['']));
            
          if (folderError) {
            console.error(`Error creating folder '${folder}':`, folderError);
          } else {
            console.log(`Created folder '${folder}' in bucket '${bucketName}'`);
          }
        } catch (folderErr) {
          console.error(`Error creating folder '${folder}':`, folderErr);
        }
      }
      
      // Set public access policies
      console.log('Creating public access policies...');
      try {
        // Policy for public read access
        const { error: readError } = await supabase.storage.from(bucketName).createSignedUrl('posters/.keep', 10);
        if (readError) {
          console.error('Error configuring bucket settings:', readError);
        }
      } catch (policyError) {
        console.error('Error configuring bucket policies:', policyError);
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Storage bucket '${bucketName}' created with folders 'posters' and 'backdrops'`,
          isNew: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      // Bucket already exists, check for the folders
      console.log(`Bucket '${bucketName}' already exists, checking folders...`);
      
      const foldersToCheck = ['posters', 'backdrops'];
      const foldersToCreate = [];
      
      for (const folder of foldersToCheck) {
        const { data: folderContents, error: listError } = await supabase.storage
          .from(bucketName)
          .list(folder);
          
        if (listError || !folderContents) {
          console.log(`Folder '${folder}' may not exist, will create it`);
          foldersToCreate.push(folder);
        } else {
          console.log(`Folder '${folder}' exists with ${folderContents.length} items`);
        }
      }
      
      // Create any missing folders
      for (const folder of foldersToCreate) {
        try {
          const { error: folderError } = await supabase.storage
            .from(bucketName)
            .upload(`${folder}/.keep`, new Blob(['']));
            
          if (folderError) {
            console.error(`Error creating folder '${folder}':`, folderError);
          } else {
            console.log(`Created folder '${folder}' in bucket '${bucketName}'`);
          }
        } catch (folderErr) {
          console.error(`Error creating folder '${folder}':`, folderErr);
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Storage bucket '${bucketName}' already exists, checked folder structure`,
          isNew: false,
          foldersCreated: foldersToCreate
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
  } catch (error) {
    console.error('Error in create-movie-storage function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
