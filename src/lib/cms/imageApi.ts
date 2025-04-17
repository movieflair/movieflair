
// Funktionen für die Bildverarbeitung im CMS
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { setupStorage } from '@/lib/setupStorage';

/**
 * Lädt ein Bild von einer URL in den lokalen Speicher herunter
 */
export const downloadImageToStorage = async (
  imageUrl: string,
  type: 'poster' | 'backdrop',
  movieId: number
): Promise<string | null> => {
  try {
    console.log(`Lade ${type}-Bild von ${imageUrl} herunter...`);
    
    // Stellt sicher, dass der Bucket existiert
    await setupStorage();
    
    // Für TMDB-URLs die Basis-URL hinzufügen, wenn es ein relativer Pfad ist
    let fullUrl = imageUrl;
    if (imageUrl.startsWith('/')) {
      fullUrl = `https://image.tmdb.org/t/p/original${imageUrl}`;
      console.log(`Vollständige URL: ${fullUrl}`);
    }
    
    // Versuchen wir die Edge-Funktion zu nutzen
    const { data, error } = await supabase.functions.invoke('create-movie-storage', {
      body: {
        movieId,
        imageUrl: imageUrl,
        imageType: type
      }
    });
    
    if (error) {
      console.error(`Fehler beim Hochladen des ${type}-Bildes durch Edge-Funktion:`, error);
      
      // Alternativ versuchen wir es direkt mit der Fetch-API
      return await downloadAndUploadDirectly(fullUrl, type, movieId);
    }
    
    if (data?.publicUrl) {
      console.log(`${type}-Bild erfolgreich gespeichert: ${data.publicUrl}`);
      return data.publicUrl;
    }
    
    return null;
  } catch (error) {
    console.error(`Fehler beim Herunterladen des ${type}-Bildes:`, error);
    return null;
  }
};

/**
 * Direkter Fallback für den Download und Upload eines Bildes
 */
async function downloadAndUploadDirectly(
  imageUrl: string, 
  type: 'poster' | 'backdrop', 
  movieId: number
): Promise<string | null> {
  try {
    console.log(`Fallback: Lade ${type} direkt von ${imageUrl}`);
    
    // Stellt sicher, dass der Bucket existiert
    await setupStorage();
    
    // Bild herunterladen
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Fehler beim Herunterladen des Bildes: ${response.statusText}`);
    }
    
    // In Blob umwandeln
    const imageBlob = await response.blob();
    
    // Blob in File für unsere Upload-Funktion umwandeln
    const file = new File([imageBlob], `${movieId}_${type}.jpg`, { type: 'image/jpeg' });
    
    // In unseren Speicher hochladen
    return uploadMovieImage(file, type, movieId);
  } catch (error) {
    console.error(`Fallback-Fehler beim Herunterladen des ${type}-Bildes:`, error);
    return null;
  }
}

/**
 * Lädt ein Bild in den movie_images Bucket hoch
 */
export const uploadMovieImage = async (
  file: File, 
  type: 'poster' | 'backdrop', 
  movieId: number
): Promise<string | null> => {
  try {
    console.log(`Lade ${type}-Bild für Film ${movieId} hoch...`);
    
    // Stellt sicher, dass der Bucket existiert
    await setupStorage();
    
    // Prüfen, ob Bucket existiert
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'movie_images');
    
    if (!bucketExists) {
      console.log('movie_images Bucket existiert nicht. Versuche ihn zu erstellen...');
      await setupStorage();
      
      // Nochmal prüfen
      const { data: checkBuckets } = await supabase.storage.listBuckets();
      if (!checkBuckets?.some(bucket => bucket.name === 'movie_images')) {
        console.error('Konnte movie_images Bucket nicht erstellen');
        toast.error("Fehler: Storage-Bucket konnte nicht erstellt werden");
        return null;
      }
    }
    
    // Dateinamen für Optimierung mit Zeitstempel versehen
    const timestamp = Date.now();
    const filePath = `${type}s/${movieId}_${timestamp}.jpg`;
    
    console.log(`Lade ${type}-Bild hoch: ${filePath}`);
    
    // Bild hochladen
    const { error, data } = await supabase.storage
      .from('movie_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Fehler beim Hochladen des Bildes:', error);
      
      // Versuche als Fallback die Edge-Funktion
      if (file.size < 2 * 1024 * 1024) { // Nur für kleinere Dateien versuchen (< 2MB)
        console.log('Versuche Edge-Funktion als Fallback...');
        return attemptUploadViaEdgeFunction(file, type, movieId);
      }
      
      toast.error(`Fehler beim Bildupload: ${error.message}`);
      return null;
    }
    
    console.log(`${type}-Bild erfolgreich hochgeladen: ${filePath}`);
    return `/storage/movie_images/${filePath}`;
  } catch (error: any) {
    console.error('Fehler beim Hochladen des Bildes:', error);
    toast.error(`Upload-Fehler: ${error.message}`);
    return null;
  }
};

/**
 * Versucht einen Upload über die Edge-Funktion
 */
async function attemptUploadViaEdgeFunction(
  file: File, 
  type: 'poster' | 'backdrop', 
  movieId: number
): Promise<string | null> {
  try {
    // Bild in Base64 konvertieren
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Entferne den Datentyp-Teil
      };
    });
    reader.readAsDataURL(file);
    const base64Data = await base64Promise;
    
    // Edge-Funktion aufrufen
    const { data, error } = await supabase.functions.invoke('upload-image', {
      body: {
        imageBase64: base64Data,
        imageType: type,
        movieId: movieId,
        fileName: `${movieId}_${Date.now()}.jpg`
      }
    });
    
    if (error) {
      console.error('Edge-Funktion Fehler:', error);
      return null;
    }
    
    return data?.publicUrl || null;
  } catch (error) {
    console.error('Fehler beim Upload via Edge-Funktion:', error);
    return null;
  }
}

/**
 * Stellt sicher, dass der movie_images Storage-Bucket existiert
 */
export const ensureMovieImagesBucketExists = async (): Promise<boolean> => {
  // Verwenden wir die setupStorage-Funktion
  try {
    await setupStorage();
    
    // Prüfen, ob der Bucket existiert
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Fehler beim Auflisten der Buckets:', error);
      return false;
    }
    
    return buckets?.some(bucket => bucket.name === 'movie_images') || false;
  } catch (error) {
    console.error('Fehler beim Sicherstellen des Storage-Buckets:', error);
    return false;
  }
};
