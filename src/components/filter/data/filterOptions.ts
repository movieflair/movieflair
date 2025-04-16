
import { Genre } from '@/lib/types';

export const genres: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Abenteuer' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Komödie' },
  { id: 80, name: 'Krimi' },
  { id: 99, name: 'Dokumentarfilm' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Familie' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'Historie' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Musik' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romanze' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV-Film' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Kriegsfilm' },
  { id: 37, name: 'Western' }
];

export const moods = [
  'fröhlich', 'nachdenklich', 'entspannend', 'romantisch', 'spannend',
  'nostalgisch', 'inspirierend', 'dramatisch', 'aufregend', 'geheimnisvoll',
  'herzerwärmend'
];

export const decades = [
  '2020',  // 2020-2029
  '2010',  // 2010-2019
  '2000',  // 2000-2009
  '1990',  // 1990-1999
  '1980',  // 1980-1989
  '1970'   // 1970-1979
];

// Diese Übersetzungstabelle für die Jahrzehnte wird für die benutzerfreundliche Anzeige verwendet
export const decadeRanges = {
  '1970': '1970er (1970-1979)',
  '1980': '1980er (1980-1989)',
  '1990': '1990er (1990-1999)',
  '2000': '2000er (2000-2009)',
  '2010': '2010er (2010-2019)',
  '2020': '2020er (2020-2029)'
};
