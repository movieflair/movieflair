
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
    // Get the bucket name from the request
    const { bucketName = 'movie_images' } = await req.json();

    console.log(`Attempting to create bucket: ${bucketName}`);

    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw new Error(`Error listing buckets: ${listError.message}`);
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket '${bucketName}' already exists.`);
      
      // Return success response with info
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Bucket '${bucketName}' already exists.`, 
          isNew: false 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

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

    console.log(`Successfully created bucket: ${bucketName}`);
    
    // Create storage policies to allow public access
    const createPoliciesResult = await createPublicBucketPolicies(bucketName);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Bucket '${bucketName}' created successfully.`,
        isNew: true,
        policies: createPoliciesResult
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in create-storage-bucket function:', error);
    
    // Return error response
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

// Helper function to create public access policies for a bucket
async function createPublicBucketPolicies(bucketName: string) {
  try {
    const results = [];
    
    // SQL to create policies
    // Note: We're using `executeRaw` to run SQL directly
    // This creates policies to allow public read access and authenticated write access
    
    // Policy for public read access
    const { data: readPolicy, error: readError } = await supabase.rpc('create_storage_policy', {
      bucket_name: bucketName,
      policy_name: `${bucketName}_public_read`,
      definition: 'true', // Anyone can read
      operation: 'SELECT',
    });
    
    results.push({ policy: 'read', success: !readError, error: readError?.message });
    
    // Policy for authenticated insert
    const { data: insertPolicy, error: insertError } = await supabase.rpc('create_storage_policy', {
      bucket_name: bucketName,
      policy_name: `${bucketName}_auth_insert`,
      definition: '(auth.role() = \'authenticated\')', // Only authenticated users can insert
      operation: 'INSERT',
    });
    
    results.push({ policy: 'insert', success: !insertError, error: insertError?.message });
    
    // Policy for authenticated update
    const { data: updatePolicy, error: updateError } = await supabase.rpc('create_storage_policy', {
      bucket_name: bucketName,
      policy_name: `${bucketName}_auth_update`,
      definition: '(auth.role() = \'authenticated\')', // Only authenticated users can update
      operation: 'UPDATE',
    });
    
    results.push({ policy: 'update', success: !updateError, error: updateError?.message });
    
    return results;
  } catch (error) {
    console.error('Error creating bucket policies:', error);
    return { error: error.message };
  }
}
