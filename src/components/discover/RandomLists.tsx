import { Shuffle } from 'lucide-react';
import { CustomList } from '@/lib/api';
import CustomListCarousel from '../movies/CustomListCarousel';
interface RandomListsProps {
  customLists: CustomList[];
}
const RandomLists = ({
  customLists
}: RandomListsProps) => {
  // Nur Listen mit Filmen berücksichtigen
  const listsWithContent = customLists.filter(list => list.movies.length > 0);
  if (listsWithContent.length === 0) {
    return null;
  }
  return <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Shuffle className="w-6 h-6 text-purple-500" />
        <h2 className="text-2xl font-semibold">Filmlisten</h2>
      </div>
      
      <div>
        {listsWithContent.map(list => <CustomListCarousel key={list.id} list={list} />)}
      </div>
    </section>;
};
export default RandomLists;