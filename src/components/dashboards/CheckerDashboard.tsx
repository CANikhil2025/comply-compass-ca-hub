
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
import { ReviewWorkspace } from '@/components/checker/ReviewWorkspace';

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Checker Dashboard</h1>
        <Button onClick={() => setActiveView('review')}>
          <Eye className="h-4 w-4 mr-2" />
          Review Workspace
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Awaiting Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Tasks Awaiting Review</span>
            </CardTitle>
            <CardDescription>Tasks submitted by makers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasksForReview.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      {task.clients?.name} • {task.maker?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(task.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge variant="secondary">Ready for Review</Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveView('review')}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
              {tasksForReview.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No tasks awaiting review
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Recent Approvals</span>
            </CardTitle>
            <CardDescription>Recently approved tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApprovals.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      {task.clients?.name} • {task.compliance_categories?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Approved: {new Date(task.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="default">Approved</Badge>
                </div>
              ))}
              {recentApprovals.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No recent approvals
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>This Week's Performance</span>
          </CardTitle>
          <CardDescription>Your review activity this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.approvedThisWeek || 0}</div>
              <div className="text-sm text-gray-600">Tasks Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.changesRequested || 0}</div>
              <div className="text-sm text-gray-600">Change Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats?.pendingReview || 0}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
