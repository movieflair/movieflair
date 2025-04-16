import { useState, useEffect } from 'react';
import { getVisitorStats, VisitorStat } from '@/lib/analyticsApi';
import { supabase } from '@/integrations/supabase/client';
import { BarChart2, Globe, Users, ArrowUpRight, ArrowDownRight, ThumbsUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, EyeIcon, PieChart, TrendingUp, Clock } from 'lucide-react';

interface PageTotals {
  [key: string]: number;
}

interface DailyVisits {
  date: string;
  count: number;
  pages: PageTotals;
}

interface HourlyDistribution {
  hour: string;
  count: number;
  percentage: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

const AdminVisitorStats = () => {
  const [stats, setStats] = useState<VisitorStat[]>([]);
  const [dailyData, setDailyData] = useState<DailyVisits[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [pageVisits, setPageVisits] = useState<PageTotals>({});
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [comparisonPeriod, setComparisonPeriod] = useState<'prev' | 'week' | 'month'>('prev');
  const [trendPercentage, setTrendPercentage] = useState(0);
  const [hourlyDistribution, setHourlyDistribution] = useState<HourlyDistribution[]>([]);
  const [deviceDistribution, setDeviceDistribution] = useState<{name: string, value: number}[]>([]);
  const [averageSessionDuration, setAverageSessionDuration] = useState(0);
  const [originDistribution, setOriginDistribution] = useState<{name: string, value: number}[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<{helpful: number, total: number}>({ helpful: 0, total: 0 });
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchVisitorOrigins = async () => {
      const { data: interactionData } = await supabase
        .from('interaction_stats')
        .select('country')
        .is('is_admin', false);

      const countryDistribution = interactionData?.reduce((acc, curr) => {
        if (curr.country) {
          acc[curr.country] = (acc[curr.country] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const distribution = Object.entries(countryDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setOriginDistribution(distribution);
    };

    const fetchFeedbackStats = async () => {
      const { data: feedbackData } = await supabase
        .from('quick_tipp_ratings')
        .select('is_helpful');

      const total = feedbackData?.length || 0;
      const helpful = feedbackData?.filter(f => f.is_helpful).length || 0;

      setFeedbackStats({ helpful, total });
    };

    const fetchUserCount = async () => {
      const { count } = await supabase
        .from('user_roles')
        .select('id', { count: 'exact' });

      setUserCount(count || 0);
    };

    const visitorStats = getVisitorStats();
    setStats(visitorStats);
    
    const total = visitorStats.reduce((sum, stat) => sum + stat.count, 0);
    setTotalVisits(total);
    
    const pages: PageTotals = {};
    visitorStats.forEach(stat => {
      if (!pages[stat.page]) {
        pages[stat.page] = 0;
      }
      pages[stat.page] += stat.count;
    });
    setPageVisits(pages);
    
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
    
    const sortedDaily = Object.values(byDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setDailyData(sortedDaily);
    
    if (sortedDaily.length > 0) {
      const currentPeriodVisits = sortedDaily.slice(-7).reduce((sum, day) => sum + day.count, 0);
      const previousPeriodVisits = sortedDaily.slice(-14, -7).reduce((sum, day) => sum + day.count, 0);
      
      if (previousPeriodVisits > 0) {
        const trend = ((currentPeriodVisits - previousPeriodVisits) / previousPeriodVisits) * 100;
        setTrendPercentage(Math.round(trend));
      }
    }
    
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i < 10 ? `0${i}:00` : `${i}:00`;
      const count = Math.floor(Math.random() * 100) + 1;
      return { hour, count, percentage: 0 };
    });
    
    const totalHourlyVisits = hours.reduce((sum, hour) => sum + hour.count, 0);
    hours.forEach(hour => {
      hour.percentage = Math.round((hour.count / totalHourlyVisits) * 100);
    });
    
    setHourlyDistribution(hours);
    
    setDeviceDistribution([
      { name: 'Desktop', value: 65 },
      { name: 'Mobile', value: 30 },
      { name: 'Tablet', value: 5 }
    ]);
    
    setAverageSessionDuration(183);

    fetchVisitorOrigins();
    fetchFeedbackStats();
    fetchUserCount();
  }, []);

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

  const getTopPages = () => {
    const pages = Object.entries(pageVisits)
      .map(([name, count]) => ({ name: formatPageName(name), value: count }))
      .sort((a, b) => b.value - a.value);
    
    return pages.slice(0, 5);
  };

  const formatPageName = (page: string) => {
    switch(page) {
      case '/': return 'Startseite';
      case 'movie-details': return 'Filmdetails';
      case 'tv-details': return 'Seriendetails';
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
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Besucherstatistik</h2>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d' | 'all')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Zeitraum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Tage</SelectItem>
              <SelectItem value="30d">30 Tage</SelectItem>
              <SelectItem value="all">Alle Zeit</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={comparisonPeriod} onValueChange={(v) => setComparisonPeriod(v as 'prev' | 'week' | 'month')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Vergleich" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prev">Vorheriger Zeitraum</SelectItem>
              <SelectItem value="week">Vorherige Woche</SelectItem>
              <SelectItem value="month">Vorheriger Monat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              <span>Gesamtbesuche</span>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full flex items-center ${
              trendPercentage >= 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {trendPercentage >= 0 
                ? <ArrowUpRight className="h-3 w-3 mr-1" /> 
                : <ArrowDownRight className="h-3 w-3 mr-1" />
              }
              {Math.abs(trendPercentage)}%
            </div>
          </div>
          <div className="text-3xl font-bold">{totalVisits}</div>
        </Card>
        
        <Card className="p-4 flex flex-col">
          <div className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span>Beliebteste Seite</span>
          </div>
          <div className="text-3xl font-bold">{getTopPages()[0]?.name || 'N/A'}</div>
        </Card>
        
        <Card className="p-4 flex flex-col">
          <div className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <Clock className="h-4 w-4" />
            <span>Durchschn. Sitzungsdauer</span>
          </div>
          <div className="text-3xl font-bold">{formatTime(averageSessionDuration)}</div>
        </Card>
        
        <Card className="p-4 flex flex-col">
          <div className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <Users className="h-4 w-4" />
            <span>Besuche pro Tag</span>
          </div>
          <div className="text-3xl font-bold">
            {dailyData.length > 0
              ? Math.round(totalVisits / dailyData.length)
              : 0
            }
          </div>
        </Card>
        
        <Card className="p-4 flex flex-col">
          <div className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <Globe className="h-4 w-4" />
            <span>Top Herkunftsländer</span>
          </div>
          <div className="text-2xl font-bold">
            {originDistribution[0]?.name || 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">
            {originDistribution[0]?.value || 0} Besuche
          </div>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <Users className="h-4 w-4" />
            <span>Registrierte Benutzer</span>
          </div>
          <div className="text-3xl font-bold">{userCount}</div>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <ThumbsUp className="h-4 w-4" />
            <span>Feedback-Statistik</span>
          </div>
          <div className="text-3xl font-bold">
            {Math.round((feedbackStats.helpful / (feedbackStats.total || 1)) * 100) || 0}%
          </div>
          <div className="text-sm text-muted-foreground">
            {feedbackStats.helpful} von {feedbackStats.total} Feedbacks
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="pages">Seitenaufrufe</TabsTrigger>
          <TabsTrigger value="time">Zeitverteilung</TabsTrigger>
          <TabsTrigger value="devices">Geräte</TabsTrigger>
          <TabsTrigger value="origin">Herkunft</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
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
                  <RechartsTooltip />
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
        </TabsContent>
        
        <TabsContent value="pages">
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
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value" name="Besuche" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="time">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Tageszeit der Besuche</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hourlyDistribution}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="count" name="Besuche" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="devices">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Geräteverteilung</h3>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={deviceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="origin">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Herkunftsländer der Besucher</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={originDistribution}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminVisitorStats;
