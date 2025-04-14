
import { useState, useEffect } from 'react';
import { getVisitorStats, VisitorStat } from '@/lib/api';
import { BarChart2, CalendarIcon, EyeIcon, PieChart, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PageTotals {
  [key: string]: number;
}

interface DailyVisits {
  date: string;
  count: number;
  pages: PageTotals;
}

const AdminVisitorStats = () => {
  const [stats, setStats] = useState<VisitorStat[]>([]);
  const [dailyData, setDailyData] = useState<DailyVisits[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [pageVisits, setPageVisits] = useState<PageTotals>({});
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    // Besucherstatistiken laden
    const visitorStats = getVisitorStats();
    setStats(visitorStats);
    
    // Berechne Gesamtzahlen
    const total = visitorStats.reduce((sum, stat) => sum + stat.count, 0);
    setTotalVisits(total);
    
    // Berechne Seitenzahlen
    const pages: PageTotals = {};
    visitorStats.forEach(stat => {
      if (!pages[stat.page]) {
        pages[stat.page] = 0;
      }
      pages[stat.page] += stat.count;
    });
    setPageVisits(pages);
    
    // Gruppiere nach Datum für Tagesstatistiken
    const byDate: { [key: string]: DailyVisits } = {};
    
    visitorStats.forEach(stat => {
      if (!byDate[stat.date]) {
        byDate[stat.date] = {
          date: stat.date,
          count: 0,
          pages: {}
        };
      }
      
      byDate[stat.date].count += stat.count;
      
      if (!byDate[stat.date].pages[stat.page]) {
        byDate[stat.date].pages[stat.page] = 0;
      }
      byDate[stat.date].pages[stat.page] += stat.count;
    });
    
    // Sortiere nach Datum
    const sortedDaily = Object.values(byDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setDailyData(sortedDaily);
  }, []);

  // Filtere nach Zeitraum
  const getFilteredData = () => {
    if (timeRange === 'all') return dailyData;
    
    const now = new Date();
    const days = timeRange === '7d' ? 7 : 30;
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return dailyData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  };

  // Berechne die beliebtesten Seiten
  const getTopPages = () => {
    const pages = Object.entries(pageVisits)
      .map(([name, count]) => ({ name: formatPageName(name), value: count }))
      .sort((a, b) => b.value - a.value);
    
    return pages.slice(0, 5); // Top 5 Seiten
  };

  const formatPageName = (page: string) => {
    switch(page) {
      case '/': return 'Startseite';
      case 'movie-details': return 'Filmdetails';
      case 'quick-tipp': return 'Quick Tipp';
      case 'free-movies': return 'Kostenlose Filme';
      case 'trailers': return 'Neue Trailer';
      case 'admin': return 'Admin-Bereich';
      default: return page;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}.${date.getMonth() + 1}`;
  };

  const chartData = getFilteredData().map(item => ({
    ...item,
    date: formatDate(item.date)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Besucherstatistik</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex flex-col items-center">
          <div className="text-3xl font-bold text-primary">{totalVisits}</div>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <EyeIcon className="h-4 w-4" />
            <span>Gesamtbesuche</span>
          </div>
        </Card>
        
        <Card className="p-4 flex flex-col items-center">
          <div className="text-3xl font-bold">{getTopPages()[0]?.name || 'N/A'}</div>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Beliebteste Seite</span>
          </div>
        </Card>
        
        <Card className="p-4 flex flex-col items-center">
          <div className="text-3xl font-bold">{dailyData.length}</div>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>Aktive Tage</span>
          </div>
        </Card>
        
        <Card className="p-4 flex flex-col items-center">
          <div className="text-3xl font-bold">
            {dailyData.length > 0
              ? Math.round(totalVisits / dailyData.length)
              : 0
            }
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <PieChart className="h-4 w-4" />
            <span>Besuche pro Tag</span>
          </div>
        </Card>
      </div>
      
      <div className="my-6 flex justify-end">
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d' | 'all')}>
          <TabsList>
            <TabsTrigger value="7d">7 Tage</TabsTrigger>
            <TabsTrigger value="30d">30 Tage</TabsTrigger>
            <TabsTrigger value="all">Alle</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Besuchertrend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Besuche" 
                stroke="#4f46e5" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Beliebteste Seiten</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getTopPages()}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Besuche" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AdminVisitorStats;
