
// Exportieren der neuen Funktion zum Abrufen von TV-Shows aus der Datenbank
export const getTvShowById = async (id: number): Promise<MovieOrShow | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_shows')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching TV show from database:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      ...data,
      genre_ids: [], 
      media_type: 'tv' as const,
      hasStream: data.hasstream,
      hasTrailer: data.hastrailer,
      streamUrl: data.streamurl,
      trailerUrl: data.trailerurl,
    };
  } catch (error) {
    console.error('Error fetching TV show from database:', error);
    return null;
  }
};
