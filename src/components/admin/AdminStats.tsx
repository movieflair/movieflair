
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminInsights from './AdminInsights';
import AdminVisitorStats from './AdminVisitorStats';

const AdminStats = () => {
  const [activeTab, setActiveTab] = useState('insights');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="insights" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="visitors">Besucherstatistik</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights">
          <AdminInsights />
        </TabsContent>
        
        <TabsContent value="visitors">
          <AdminVisitorStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStats;
