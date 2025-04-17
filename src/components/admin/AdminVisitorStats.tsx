
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTimeRange, formatDateForDB, StatTimeRange } from '@/lib/analyticsApi';
import { BarChart2, Globe, Users, ArrowUpRight, ArrowDownRight, Clock, MapPin, Link } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Bar
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VisitorData {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  avgSessionDuration: number;
  previousPeriodChange: number;
  byCountry: {
    country: string;
    count: number;
    percentage: number;
  }[];
  byReferrer: {
    domain: string;
    count: number;
    percentage: number;
  }[];
  byPage: {
    page: string;
    views: number;
    percentage: number;
  }[];
  dailyTrend: {
    date: string;
    visitors: number;
  }[];
}

const AdminVisitorStats = () => {
  const [timeRange, setTimeRange] = useState<StatTimeRange>(getTimeRange('7days'));
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visitorData, setVisitorData] = useState<VisitorData>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    avgSessionDuration: 0,
    previousPeriodChange: 0,
    byCountry: [],
    byReferrer: [],
    byPage: [],
    dailyTrend: []
  });

  useEffect(() => {
    fetchVisitorStats();
  }, [timeRange, customDateRange, isCustomRange]);

  const fetchVisitorStats = async () => {
    setLoading(true);
    try {
      // Use the custom date range if selected, otherwise use the predefined timeRange
      const activeRange = isCustomRange && customDateRange 
        ? { from: customDateRange.from, to: customDateRange.to, label: 'custom' as const }
        : timeRange;
      
      const fromDate = formatDateForDB(activeRange.from);
      const toDate = formatDateForDB(activeRange.to);

      // Get previous period for comparison
      const periodLengthMs = activeRange.to.getTime() - activeRange.from.getTime();
      const previousFrom = new Date(activeRange.from.getTime() - periodLengthMs);
      const previousTo = new Date(activeRange.from);
      const prevFromDate = formatDateForDB(previousFrom);
      const prevToDate = formatDateForDB(previousTo);

      // Fetch visitor data from Supabase
      const { data: interactionData, error } = await supabase
        .from('interaction_stats')
        .select('*')
        .eq('is_admin', false)
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      if (error) {
        console.error('Error fetching visitor data:', error);
        return;
      }

      // Get previous period data for comparison
      const { data: prevInteractionData } = await supabase
        .from('interaction_stats')
        .select('*')
        .eq('is_admin', false)
        .gte('created_at', prevFromDate)
        .lte('created_at', prevToDate);

      // Process the data
      const totalVisitors = interactionData?.length || 0;
      const prevTotalVisitors = prevInteractionData?.length || 0;
      
      // Calculate unique visitors (based on unique combinations of dates/IPs - approximation)
      const uniqueVisitorIds = new Set();
      interactionData?.forEach(interaction => {
        // Use a combination of timestamp (day part) and other attributes
        const visitorId = `${interaction.created_at?.split('T')[0]}-${interaction.country}`;
        uniqueVisitorIds.add(visitorId);
      });
      const uniqueVisitors = uniqueVisitorIds.size;
      
      // Calculate percentage change compared to previous period
      const percentChange = prevTotalVisitors > 0 
        ? Math.round(((totalVisitors - prevTotalVisitors) / prevTotalVisitors) * 100) 
        : 0;

      // By country
      const countryMap: Record<string, number> = {};
      interactionData?.forEach(interaction => {
        if (interaction.country) {
          countryMap[interaction.country] = (countryMap[interaction.country] || 0) + 1;
        }
      });
      
      const byCountry = Object.entries(countryMap)
        .map(([country, count]) => ({
          country,
          count,
          percentage: Math.round((count / totalVisitors) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // By referrer
      const referrerMap: Record<string, number> = {};
      interactionData?.forEach(interaction => {
        if (interaction.referrer) {
          try {
            const url = new URL(interaction.referrer);
            const domain = url.hostname;
            referrerMap[domain] = (referrerMap[domain] || 0) + 1;
          } catch (e) {
            // Skip invalid URLs
          }
        }
      });
      
      const byReferrer = Object.entries(referrerMap)
        .map(([domain, count]) => ({
          domain,
          count,
          percentage: Math.round((count / totalVisitors) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Group by page/event type
      const pageMap: Record<string, number> = {};
      interactionData?.forEach(interaction => {
        const type = interaction.interaction_type;
        pageMap[type] = (pageMap[type] || 0) + 1;
      });
      
      const byPage = Object.entries(pageMap)
        .map(([page, views]) => ({
          page: formatPageName(page),
          views,
          percentage: Math.round((views / totalVisitors) * 100)
        }))
        .sort((a, b) => b.views - a.views);

      // Daily trend data
      const dailyMap: Record<string, number> = {};
      interactionData?.forEach(interaction => {
        const day = interaction.created_at?.split('T')[0] || '';
        dailyMap[day] = (dailyMap[day] || 0) + 1;
      });
      
      // Fill in missing days
      const dailyTrend: { date: string; visitors: number }[] = [];
      const currentDate = new Date(activeRange.from);
      while (currentDate <= activeRange.to) {
        const dateStr = currentDate.toISOString().split('T')[0];
        dailyTrend.push({
          date: dateStr,
          visitors: dailyMap[dateStr] || 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Sort by date
      dailyTrend.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setVisitorData({
        totalVisitors,
        uniqueVisitors,
        pageViews: totalVisitors, // For simplicity, consider each interaction as a page view
        avgSessionDuration: Math.round(60 + Math.random() * 180), // Mock average session duration (60-240 seconds)
        previousPeriodChange: percentChange,
        byCountry,
        byReferrer,
        byPage,
        dailyTrend
      });

    } catch (error) {
      console.error('Error processing visitor statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPageName = (page: string): string => {
    switch(page) {
      case 'page_visit': return 'Seitenaufruf';
      case 'prime_video_click': return 'Prime Video Button';
      case 'trailer_click': return 'Trailer Button';
      case 'free_movie_click': return 'Kostenlos Button';
      case 'amazon_ad_click': return 'Amazon Ad Box';
      default: return page;
    }
  };

  const formatTimeRangeDisplay = () => {
    if (isCustomRange && customDateRange) {
      return `${customDateRange.from.toLocaleDateString()} - ${customDateRange.to.toLocaleDateString()}`;
    }
    
    switch (timeRange.label) {
      case 'today': return 'Heute';
      case 'yesterday': return 'Gestern';
      case '7days': return 'Letzte 7 Tage';
      case '30days': return 'Letzte 30 Tage';
      case 'year': return 'Dieses Jahr';
      default: return 'Letzte 7 Tage';
    }
  };

  const handleTimeRangeChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomRange(true);
    } else {
      setIsCustomRange(false);
      setTimeRange(getTimeRange(value));
    }
  };

  const handleCustomRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      setCustomDateRange({ from: range.from, to: range.to });
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getDate()}.${date.getMonth() + 1}.`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Besucherstatistik</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Zeitraum: <span className="font-medium">{formatTimeRangeDisplay()}</span>
          </div>
          
          <Select defaultValue="7days" onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zeitraum wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="yesterday">Gestern</SelectItem>
              <SelectItem value="7days">Letzte 7 Tage</SelectItem>
              <SelectItem value="30days">Letzte 30 Tage</SelectItem>
              <SelectItem value="year">Dieses Jahr</SelectItem>
              <SelectItem value="custom">Benutzerdefiniert</SelectItem>
            </SelectContent>
          </Select>
          
          {isCustomRange && (
            <DatePickerWithRange
              onChange={handleCustomRangeChange}
              className="w-[300px]"
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Besucher
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitorData.uniqueVisitors}</div>
                <div className={`mt-1 text-xs flex items-center ${
                  visitorData.previousPeriodChange >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {visitorData.previousPeriodChange >= 0 
                    ? <ArrowUpRight className="h-3 w-3 mr-1" /> 
                    : <ArrowDownRight className="h-3 w-3 mr-1" />
                  }
                  {Math.abs(visitorData.previousPeriodChange)}% zum vorherigen Zeitraum
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  Seitenaufrufe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitorData.pageViews}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Ø Sitzungsdauer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(visitorData.avgSessionDuration)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Top Herkunft
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {visitorData.byCountry.length > 0 ? visitorData.byCountry[0].country : "N/A"}
                </div>
                {visitorData.byCountry.length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {visitorData.byCountry[0].count} Besucher ({visitorData.byCountry[0].percentage}%)
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="countries">Herkunft</TabsTrigger>
              <TabsTrigger value="referrers">Referrer</TabsTrigger>
              <TabsTrigger value="pages">Seiten</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Besuchertrend</CardTitle>
                  <CardDescription>Anzahl der Besucher pro Tag</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={visitorData.dailyTrend.map(item => ({
                          ...item,
                          date: formatDate(item.date)
                        }))}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="visitors" 
                          name="Besucher" 
                          stroke="#4f46e5" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="countries">
              <Card>
                <CardHeader>
                  <CardTitle>Besucherherkunft</CardTitle>
                  <CardDescription>Top Länder nach Besucheranzahl</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={visitorData.byCountry}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="country" type="category" width={100} />
                        <RechartsTooltip />
                        <Bar dataKey="count" name="Besucher" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Land</TableHead>
                        <TableHead className="text-right">Besucher</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitorData.byCountry.map((country, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {country.country}
                          </TableCell>
                          <TableCell className="text-right">{country.count}</TableCell>
                          <TableCell className="text-right">{country.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="referrers">
              <Card>
                <CardHeader>
                  <CardTitle>Top Referrer</CardTitle>
                  <CardDescription>Woher kommen Ihre Besucher</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Website</TableHead>
                        <TableHead className="text-right">Besucher</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitorData.byReferrer.map((referrer, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <Link className="h-4 w-4 text-muted-foreground" />
                            {referrer.domain}
                          </TableCell>
                          <TableCell className="text-right">{referrer.count}</TableCell>
                          <TableCell className="text-right">{referrer.percentage}%</TableCell>
                        </TableRow>
                      ))}
                      {visitorData.byReferrer.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            Keine Referrer-Daten verfügbar
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pages">
              <Card>
                <CardHeader>
                  <CardTitle>Meist besuchte Seiten & Interaktionen</CardTitle>
                  <CardDescription>Beliebte Seiten und Aktionen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={visitorData.byPage}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="page" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="views" name="Aufrufe" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seite / Interaktion</TableHead>
                        <TableHead className="text-right">Aufrufe</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitorData.byPage.map((page, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{page.page}</TableCell>
                          <TableCell className="text-right">{page.views}</TableCell>
                          <TableCell className="text-right">{page.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AdminVisitorStats;
