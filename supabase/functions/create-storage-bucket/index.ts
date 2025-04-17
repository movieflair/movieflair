
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name } = await req.json();
    
    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Missing bucket name' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Attempting to create bucket: ${name}`);
    
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to list buckets', details: listError }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === name);
    
    if (bucketExists) {
      console.log(`Bucket '${name}' already exists.`);
      return new Response(
        JSON.stringify({ message: `Bucket '${name}' already exists.` }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Create the bucket
    const { data, error } = await supabaseAdmin.storage.createBucket(name, {
      public: true,
      fileSizeLimit: 100 * 1024 * 1024, // 100MB
    });
    
    if (error) {
      console.error(`Error creating bucket '${name}':`, error);
      return new Response(
        JSON.stringify({ error: 'Failed to create bucket', details: error }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Create a policy to allow authenticated users to upload files
    const uploadPolicyResponse = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: name,
      policy_name: `${name}_authenticated_uploads`,
      definition: 'auth.role() = \'authenticated\'',
      operation: 'INSERT'
    });
    
    // Create a policy to allow everyone to read files
    const readPolicyResponse = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: name,
      policy_name: `${name}_public_reads`,
      definition: 'true',
      operation: 'SELECT'
    });
    
    console.log(`Bucket '${name}' created successfully.`);
    
    return new Response(
      JSON.stringify({ 
        message: `Bucket '${name}' created successfully`, 
        data 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
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
});
