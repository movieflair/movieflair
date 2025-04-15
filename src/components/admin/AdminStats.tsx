
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface RatingsChartProps {
  usefulCount: number;
  notUsefulCount: number;
}

const COLORS = ['#059669', '#EF4444'];

const RatingsChart = ({ usefulCount, notUsefulCount }: RatingsChartProps) => {
  const data = [
    { name: 'Hilfreich', value: usefulCount },
    { name: 'Nicht hilfreich', value: notUsefulCount },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={60} dataKey="value" label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const AdminStats = () => {
  const [userCount, setUserCount] = useState(0);
  const [usefulCount, setUsefulCount] = useState(0);
  const [notUsefulCount, setNotUsefulCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch user count from auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('Error fetching users:', authError);
        } else {
          setUserCount(authData?.users?.length || 0);
        }
        
        // Fetch ratings data
        const { data, error } = await supabase
          .from('quick_tipp_ratings')
          .select('is_helpful');
        
        if (error) {
          console.error('Error fetching ratings:', error);
        } else if (data) {
          const useful = data.filter(item => item.is_helpful).length;
          const notUseful = data.filter(item => !item.is_helpful).length;
          
          setUsefulCount(useful);
          setNotUsefulCount(notUseful);
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
          <CardTitle>Benutzer</CardTitle>
          <CardDescription>Anzahl der registrierten Benutzer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{loading ? '...' : userCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Tipp Bewertungen</CardTitle>
          <CardDescription>Wie hilfreich sind die Quick Tipps?</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Lädt...</div>
          ) : (
            <RatingsChart usefulCount={usefulCount} notUsefulCount={notUsefulCount} />
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Insgesamt: {usefulCount + notUsefulCount} Bewertungen
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminStats;
