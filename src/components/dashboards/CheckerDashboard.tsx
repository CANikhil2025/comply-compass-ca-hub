import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  FileText,
  TrendingUp
} from 'lucide-react';
import { ReviewWorkspace } from '../checker/ReviewWorkspace';
import { UpcomingTasksWidget } from '../tasks/UpcomingTasksWidget';

export const CheckerDashboard = () => {
  const { profile } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  const { data: stats } = useQuery({
    queryKey: ['checker-stats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const [
        { count: myTasks },
        { count: pendingReview },
        { count: approvedThisWeek },
        { count: changesRequested }
      ] = await Promise.all([
        supabase.from('tasks').select('*', { count: 'exact', head: true })
          .eq('checker_id', profile.id),
        supabase.from('tasks').select('*', { count: 'exact', head: true })
          .eq('checker_id', profile.id)
          .eq('status', 'ready_for_review'),
        supabase.from('tasks').select('*', { count: 'exact', head: true })
          .eq('checker_id', profile.id)
          .eq('status', 'approved')
          .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('task_comments').select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('comment_type', 'change_request')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);
      
      return {
        myTasks: myTasks || 0,
        pendingReview: pendingReview || 0,
        approvedThisWeek: approvedThisWeek || 0,
        changesRequested: changesRequested || 0
      };
    },
    enabled: !!profile?.id
  });

  const { data: tasksForReview = [] } = useQuery({
    queryKey: ['checker-tasks-preview', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          clients(name),
          compliance_categories(name),
          compliance_forms(name),
          maker:user_profiles!tasks_maker_id_fkey(full_name)
        `)
        .eq('checker_id', profile.id)
        .eq('status', 'ready_for_review')
        .order('end_date')
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  const { data: recentApprovals = [] } = useQuery({
    queryKey: ['recent-approvals', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          clients(name),
          compliance_categories(name)
        `)
        .eq('checker_id', profile.id)
        .eq('status', 'approved')
        .order('updated_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  if (activeView === 'review') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
        <ReviewWorkspace />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Checker Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.myTasks || 0}</div>
            <p className="text-xs text-muted-foreground">Total assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingReview || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.approvedThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">Tasks approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Changes Requested</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.changesRequested || 0}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Tasks */}
        <UpcomingTasksWidget />
        
        {/* Review Workspace */}
        <Card>
          <CardHeader>
            <CardTitle>Review Queue</CardTitle>
            <CardDescription>Tasks awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewWorkspace />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
