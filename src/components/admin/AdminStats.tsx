
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ActivitySquare, ThumbsUp, ThumbsDown, BarChart, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface RatingCounts {
  helpful: number;
  notHelpful: number;
  total: number;
  helpfulPercentage: number;
}

const AdminStats = () => {
  const [ratingStats, setRatingStats] = useState<RatingCounts>({ 
    helpful: 0, 
    notHelpful: 0, 
    total: 0, 
    helpfulPercentage: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch user count by counting unique user_ids in the watchlist table
        const { count: usersCount, error: countError } = await supabase
          .from('watchlist')
          .select('user_id', { count: 'exact', head: true })
          .limit(1);
        
        if (countError) {
          console.error('Error fetching user count:', countError);
          setUserCount(0);
        } else {
          setUserCount(usersCount || 0);
        }
        
        // Fetch ratings data
        const { data, error } = await supabase
          .from('quick_tipp_ratings')
          .select('is_helpful');
        
        if (error) throw error;

        if (data) {
          const helpfulCount = data.filter(item => item.is_helpful).length;
          const notHelpfulCount = data.length - helpfulCount;
          const totalCount = data.length;
          const helpfulPercentage = totalCount > 0 
            ? Math.round((helpfulCount / totalCount) * 100) 
            : 0;
          
          setRatingStats({
            helpful: helpfulCount,
            notHelpful: notHelpfulCount,
            total: totalCount,
            helpfulPercentage: helpfulPercentage
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Die Statistikdaten konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const pieData = [
    { name: 'Hilfreich', value: ratingStats.helpful, color: '#4caf50' },
    { name: 'Nicht hilfreich', value: ratingStats.notHelpful, color: '#f44336' }
  ];

  const chartConfig = {
    helpful: { 
      label: 'Hilfreich',
      color: '#4caf50'
    },
    notHelpful: {
      label: 'Nicht hilfreich',
      color: '#f44336'
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Feedback-Statistiken</h2>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full" />
        </div>
      ) : error ? (
        <div className="p-4 border border-destructive/30 bg-destructive/10 rounded-md text-destructive">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="p-4 flex flex-col items-center">
            <div className="text-3xl font-bold text-primary">{userCount}</div>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Registrierte Nutzer</span>
            </div>
          </Card>
          
          <Card className="p-4 flex flex-col items-center">
            <div className="text-3xl font-bold text-[#4caf50]">{ratingStats.helpful}</div>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span>Ja-Stimmen</span>
            </div>
          </Card>
          
          <Card className="p-4 flex flex-col items-center">
            <div className="text-3xl font-bold text-[#f44336]">{ratingStats.notHelpful}</div>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <ThumbsDown className="h-4 w-4" />
              <span>Nein-Stimmen</span>
            </div>
          </Card>
          
          <Card className="p-4 flex flex-col items-center">
            <div className="text-3xl font-bold">{ratingStats.helpfulPercentage}%</div>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <ActivitySquare className="h-4 w-4" />
              <span>Zufriedenheitsrate</span>
            </div>
          </Card>
        </div>
      )}
      
      {!loading && !error && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Bewertungsverteilung</h3>
          <div className="h-64">
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {ratingStats.total === 0 ? (
              "Noch keine Bewertungen vorhanden."
            ) : (
              `${ratingStats.helpfulPercentage}% der Benutzer fanden die Vorschläge hilfreich.`
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminStats;
