
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Stats {
  watchlistCount: number;
  primeClicks: number;
  adClicks: number;
  trailerClicks: number;
  freeMovieClicks: number;
  countryStats: { country: string; count: number }[];
  referrerStats: { referrer: string; count: number }[];
}

const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    watchlistCount: 0,
    primeClicks: 0,
    adClicks: 0,
    trailerClicks: 0,
    freeMovieClicks: 0,
    countryStats: [],
    referrerStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const [watchlistData, interactionData] = await Promise.all([
          supabase
            .from('watchlist')
            .select('id', { count: 'exact' }),
          supabase
            .from('interaction_stats')
            .select('*')
            .eq('is_admin', false)
        ]);

        if (interactionData.data) {
          const interactions = interactionData.data;
          
          // Count different types of clicks
          const primeClicks = interactions.filter(i => i.interaction_type === 'prime_video_click').length;
          const adClicks = interactions.filter(i => i.interaction_type === 'amazon_ad_click').length;
          const trailerClicks = interactions.filter(i => i.interaction_type === 'trailer_click').length;
          const freeMovieClicks = interactions.filter(i => i.interaction_type === 'free_movie_click').length;

          // Group by country
          const countryData = interactions.reduce((acc, curr) => {
            if (curr.country) {
              acc[curr.country] = (acc[curr.country] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);

          // Group by referrer
          const referrerData = interactions.reduce((acc, curr) => {
            if (curr.referrer) {
              const hostname = new URL(curr.referrer).hostname;
              acc[hostname] = (acc[hostname] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);

          setStats({
            watchlistCount: watchlistData.count || 0,
            primeClicks,
            adClicks,
            trailerClicks,
            freeMovieClicks,
            countryStats: Object.entries(countryData).map(([country, count]) => ({ 
              country, 
              count 
            })),
            referrerStats: Object.entries(referrerData).map(([referrer, count]) => ({ 
              referrer, 
              count 
            }))
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Anzahl der Filme auf Merklisten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{loading ? '...' : stats.watchlistCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prime Video</CardTitle>
          <CardDescription>Klicks auf Prime Video Links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{loading ? '...' : stats.primeClicks}</div>
          <div className="text-sm text-muted-foreground mt-2">
            Amazon Ad Box: {stats.adClicks} Klicks
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stream Button Klicks</CardTitle>
          <CardDescription>Verteilung der Klicks auf Stream Buttons</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'Trailer', value: stats.trailerClicks },
              { name: 'Kostenlos', value: stats.freeMovieClicks }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Besucherstatistik</CardTitle>
          <CardDescription>Woher kommen die Besucher?</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Land</TableHead>
                <TableHead className="text-right">Besucher</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.countryStats.map(({ country, count }) => (
                <TableRow key={country}>
                  <TableCell>{country}</TableCell>
                  <TableCell className="text-right">{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Top Referrer</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Besucher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.referrerStats.map(({ referrer, count }) => (
                  <TableRow key={referrer}>
                    <TableCell>{referrer}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
