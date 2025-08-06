import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Lightbulb, Calendar } from "lucide-react";

interface VisitorData {
  date: string;
  visitors: number;
}

interface IdeaData {
  category: string;
  count: number;
  label: string;
}

const COLORS = ['hsl(262 83% 58%)', 'hsl(195 100% 50%)', 'hsl(142 76% 36%)', 'hsl(0 84% 60%)', 'hsl(39 77% 58%)', 'hsl(280 100% 70%)'];

const categoryLabels: Record<string, string> = {
  daily_hurdles: "Daily Hurdles",
  blue_yonder: "Blue Yonder",
  kinaxis: "Kinaxis", 
  coupa: "Coupa",
  manhattan: "Manhattan",
  other_scm: "Other SCM"
};

const AnalyticsDashboard = () => {
  const [visitorData, setVisitorData] = useState<VisitorData[]>([]);
  const [ideaData, setIdeaData] = useState<IdeaData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // Track visitor
    supabase.rpc("increment_visitor_count");
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch visitor analytics for last 7 days
      const { data: visitors, error: visitorError } = await supabase
        .from("visitor_analytics")
        .select("date, visitor_count")
        .order("date", { ascending: true })
        .limit(7);

      if (visitorError) throw visitorError;

      const visitorChartData = visitors?.map(v => ({
        date: new Date(v.date).toLocaleDateString(),
        visitors: v.visitor_count
      })) || [];

      setVisitorData(visitorChartData);

      // Fetch idea analytics by category
      const { data: ideas, error: ideaError } = await supabase
        .from("idea_analytics")
        .select("category, submission_count")
        .order("submission_count", { ascending: false });

      if (ideaError) throw ideaError;

      const ideaChartData = ideas?.map(i => ({
        category: i.category,
        count: i.submission_count,
        label: categoryLabels[i.category] || i.category
      })) || [];

      setIdeaData(ideaChartData);

      // Fetch total counts
      const { count: userCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      const { count: ideaCount } = await supabase
        .from("ideas")
        .select("*", { count: "exact", head: true });

      setTotalUsers(userCount || 0);
      setTotalIdeas(ideaCount || 0);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const todayVisitors = visitorData[visitorData.length - 1]?.visitors || 0;
  const totalSubmissions = ideaData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-primary">{totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-innovation/10 to-innovation/5 border-innovation/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ideas</p>
                <p className="text-3xl font-bold text-innovation">{totalIdeas}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-innovation" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Visitors</p>
                <p className="text-3xl font-bold text-success">{todayVisitors}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary-glow/10 to-primary-glow/5 border-primary-glow/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submissions</p>
                <p className="text-3xl font-bold text-primary-glow">{totalSubmissions}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary-glow" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Visitor Trend</CardTitle>
            <CardDescription>Visitor traffic over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ideas by Category</CardTitle>
            <CardDescription>Distribution of submitted ideas across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ideaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ideaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;