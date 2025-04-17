
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // CORS-Präflug-Anfrage behandeln
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Supabase-Client mit Admin-Rolle erstellen
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
    
    console.log('Prüfe, ob movie_images Bucket existiert...');
    
    // Prüfen, ob der Bucket bereits existiert
    const { data: existingBuckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Fehler beim Auflisten von Buckets:', bucketsError);
      return new Response(JSON.stringify({ 
        error: 'Fehler beim Auflisten von Buckets', 
        details: bucketsError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const bucketExists = existingBuckets?.some(bucket => bucket.name === 'movie_images');
    
    if (bucketExists) {
      console.log('movie_images Bucket existiert bereits');
      return new Response(JSON.stringify({ 
        message: 'Bucket existiert bereits',
        bucketName: 'movie_images',
        status: 'success' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Bucket erstellen, wenn er nicht existiert
    console.log('Erstelle movie_images Bucket...');
    const { data: newBucket, error: createError } = await supabaseAdmin
      .storage
      .createBucket('movie_images', {
        public: true,
        fileSizeLimit: 20971520, // 20MB Limit in Bytes
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      });
    
    if (createError) {
      console.error('Fehler bei der Bucket-Erstellung:', createError);
      return new Response(JSON.stringify({ 
        error: 'Fehler bei der Bucket-Erstellung', 
        details: createError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Erstelle Ordner im Bucket...');
    
    // Funktion zum Erstellen eines leeren Markers für die Ordnerstruktur
    const createFolderMarker = async (folderPath: string) => {
      const { error } = await supabaseAdmin
        .storage
        .from('movie_images')
        .upload(`${folderPath}/.folder`, new Blob([''], { type: 'text/plain' }));
      
      if (error) {
        console.error(`Fehler beim Erstellen des Ordners ${folderPath}:`, error);
      } else {
        console.log(`Ordner erstellt: ${folderPath}`);
      }
    };
    
    // Ordner für Poster und Hintergrundbilder erstellen
    await createFolderMarker('posters');
    await createFolderMarker('backdrops');
    
    return new Response(JSON.stringify({ 
      message: 'Bucket und Ordner erfolgreich erstellt',
      bucketName: 'movie_images',
      status: 'success' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Unerwarteter Fehler:', error);
    return new Response(JSON.stringify({ 
      error: 'Unerwarteter Fehler', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
