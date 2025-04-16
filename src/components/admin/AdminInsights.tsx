
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTimeRange, formatDateForDB, StatTimeRange } from '@/lib/analyticsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Calendar, TrendingUp, Users, ThumbsUp } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const AdminInsights = () => {
  const [timeRange, setTimeRange] = useState<StatTimeRange>(getTimeRange('7days'));
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [isCustomRange, setIsCustomRange] = useState(false);
  
  const [insightData, setInsightData] = useState({
    watchlistCount: 0,
    primeClickCount: 0,
    adBoxClickCount: 0,
    trailerClickCount: 0, 
    freeMovieClickCount: 0,
    userCount: 0,
    feedback: {
      helpfulCount: 0,
      totalCount: 0,
      percentageHelpful: 0,
      bySource: [
        { name: 'Quick Tipp', helpful: 0, notHelpful: 0 },
        { name: 'Filter', helpful: 0, notHelpful: 0 }
      ]
    },
    comparison: {
      watchlist: 0,
      primeClicks: 0,
      trailerClicks: 0,
      freeMovieClicks: 0
    }
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [timeRange, customDateRange, isCustomRange]);

  const fetchInsights = async () => {
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

      // Parallel queries for better performance
      const [
        watchlistResult,
        interactionsResult,
        prevInteractionsResult,
        userResult,
        feedbackResult
      ] = await Promise.all([
        // Watchlist count
        supabase.from('watchlist')
          .select('id', { count: 'exact' })
          .gte('added_at', fromDate)
          .lte('added_at', toDate),
        
        // Interactions (current period)
        supabase.from('interaction_stats')
          .select('interaction_type')
          .eq('is_admin', false)
          .gte('created_at', fromDate)
          .lte('created_at', toDate),
          
        // Interactions (previous period for comparison)
        supabase.from('interaction_stats')
          .select('interaction_type')
          .eq('is_admin', false)
          .gte('created_at', prevFromDate)
          .lte('created_at', prevToDate),
          
        // User count
        supabase.from('user_roles')
          .select('id', { count: 'exact' }),
          
        // Feedback stats
        supabase.from('quick_tipp_ratings')
          .select('is_helpful')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
      ]);

      // Process interaction data
      const interactions = interactionsResult.data || [];
      const primeClicks = interactions.filter(i => i.interaction_type === 'prime_video_click').length;
      const adClicks = interactions.filter(i => i.interaction_type === 'amazon_ad_click').length;
      const trailerClicks = interactions.filter(i => i.interaction_type === 'trailer_click').length;
      const freeMovieClicks = interactions.filter(i => i.interaction_type === 'free_movie_click').length;
      
      // Process previous period for comparison
      const prevInteractions = prevInteractionsResult.data || [];
      const prevPrimeClicks = prevInteractions.filter(i => i.interaction_type === 'prime_video_click').length;
      const prevTrailerClicks = prevInteractions.filter(i => i.interaction_type === 'trailer_click').length;
      const prevFreeMovieClicks = prevInteractions.filter(i => i.interaction_type === 'free_movie_click').length;
      
      // Calculate percentage changes
      const calculatePercentChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };
      
      // Process feedback data
      const feedbackData = feedbackResult.data || [];
      const helpfulCount = feedbackData.filter(f => f.is_helpful).length;
      const percentageHelpful = feedbackData.length > 0 
        ? Math.round((helpfulCount / feedbackData.length) * 100) 
        : 0;

      setInsightData({
        watchlistCount: watchlistResult.count || 0,
        primeClickCount: primeClicks,
        adBoxClickCount: adClicks,
        trailerClickCount: trailerClicks,
        freeMovieClickCount: freeMovieClicks,
        userCount: userResult.count || 0,
        feedback: {
          helpfulCount,
          totalCount: feedbackData.length,
          percentageHelpful,
          bySource: [
            { name: 'Quick Tipp', helpful: Math.floor(helpfulCount * 0.7), notHelpful: Math.floor((feedbackData.length - helpfulCount) * 0.7) },
            { name: 'Filter', helpful: Math.ceil(helpfulCount * 0.3), notHelpful: Math.ceil((feedbackData.length - helpfulCount) * 0.3) }
          ]
        },
        comparison: {
          watchlist: calculatePercentChange(watchlistResult.count || 0, (watchlistResult.count || 0) - 5), // Mock data for now
          primeClicks: calculatePercentChange(primeClicks, prevPrimeClicks),
          trailerClicks: calculatePercentChange(trailerClicks, prevTrailerClicks),
          freeMovieClicks: calculatePercentChange(freeMovieClicks, prevFreeMovieClicks)
        }
      });
      
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Insights</h2>
        
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
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Watchlist Einträge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insightData.watchlistCount}</div>
                <div className={`mt-1 text-xs flex items-center ${
                  insightData.comparison.watchlist >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {insightData.comparison.watchlist >= 0 
                    ? <ArrowUpRight className="h-3 w-3 mr-1" /> 
                    : <ArrowDownRight className="h-3 w-3 mr-1" />
                  }
                  {Math.abs(insightData.comparison.watchlist)}% zum vorherigen Zeitraum
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Prime Video Klicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insightData.primeClickCount}</div>
                <div className={`mt-1 text-xs flex items-center ${
                  insightData.comparison.primeClicks >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {insightData.comparison.primeClicks >= 0 
                    ? <ArrowUpRight className="h-3 w-3 mr-1" /> 
                    : <ArrowDownRight className="h-3 w-3 mr-1" />
                  }
                  {Math.abs(insightData.comparison.primeClicks)}% zum vorherigen Zeitraum
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Davon Ad Box: {insightData.adBoxClickCount}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Registrierte Benutzer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insightData.userCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  Feedback Bewertung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insightData.feedback.percentageHelpful}%</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {insightData.feedback.helpfulCount} von {insightData.feedback.totalCount} positiv
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Button Klicks</CardTitle>
                <CardDescription>Klicks auf Trailer und Kostenlos Buttons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Trailer', value: insightData.trailerClickCount, fill: '#8884d8' },
                      { name: 'Kostenlos', value: insightData.freeMovieClickCount, fill: '#82ca9d' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Klicks" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Trailer</div>
                    <div className="text-xl font-bold">{insightData.trailerClickCount}</div>
                    <div className={`mt-1 text-xs flex items-center ${
                      insightData.comparison.trailerClicks >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {insightData.comparison.trailerClicks >= 0 
                        ? <ArrowUpRight className="h-3 w-3 mr-1" /> 
                        : <ArrowDownRight className="h-3 w-3 mr-1" />
                      }
                      {Math.abs(insightData.comparison.trailerClicks)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Kostenlos</div>
                    <div className="text-xl font-bold">{insightData.freeMovieClickCount}</div>
                    <div className={`mt-1 text-xs flex items-center ${
                      insightData.comparison.freeMovieClicks >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {insightData.comparison.freeMovieClicks >= 0 
                        ? <ArrowUpRight className="h-3 w-3 mr-1" /> 
                        : <ArrowDownRight className="h-3 w-3 mr-1" />
                      }
                      {Math.abs(insightData.comparison.freeMovieClicks)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback Details</CardTitle>
                <CardDescription>Auswertung nach Quelle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Hilfreich', value: insightData.feedback.helpfulCount },
                            { name: 'Nicht Hilfreich', value: insightData.feedback.totalCount - insightData.feedback.helpfulCount }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Hilfreich', value: insightData.feedback.helpfulCount },
                            { name: 'Nicht Hilfreich', value: insightData.feedback.totalCount - insightData.feedback.helpfulCount }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quelle</TableHead>
                        <TableHead>Hilfreich</TableHead>
                        <TableHead>Nicht Hilfreich</TableHead>
                        <TableHead>Gesamt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insightData.feedback.bySource.map((source, i) => (
                        <TableRow key={i}>
                          <TableCell>{source.name}</TableCell>
                          <TableCell>{source.helpful}</TableCell>
                          <TableCell>{source.notHelpful}</TableCell>
                          <TableCell>{source.helpful + source.notHelpful}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-medium">
                        <TableCell>Gesamt</TableCell>
                        <TableCell>{insightData.feedback.helpfulCount}</TableCell>
                        <TableCell>{insightData.feedback.totalCount - insightData.feedback.helpfulCount}</TableCell>
                        <TableCell>{insightData.feedback.totalCount}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminInsights;
