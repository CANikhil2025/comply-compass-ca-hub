
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
  Calendar,
  FileText,
  TrendingUp
} from 'lucide-react';
import { TaskWorkspace } from '@/components/maker/TaskWorkspace';

export const MakerDashboard = () => {
  const { profile } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  const { data: stats } = useQuery({
    queryKey: ['maker-stats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const [
        { count: myTasks },
        { count: inProgress },
        { count: completedThisWeek },
        { count: overdueTasks }
      ] = await Promise.all([
        supabase.from('tasks').select('*', { count: 'exact', head: true })
          .eq('maker_id', profile.id),
        supabase.from('tasks').select('*', { count: 'exact', head: true })
          .eq('maker_id', profile.id)
          .eq('status', 'in_progress'),
        supabase.from('tasks').select('*', { count: 'exact', head: true })
          .eq('maker_id', profile.id)
          .eq('status', 'done')
          .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('tasks').select('*', { count: 'exact', head: true })
          .eq('maker_id', profile.id)
          .eq('status', 'overdue')
      ]);
      
      return {
        myTasks: myTasks || 0,
        inProgress: inProgress || 0,
        completedThisWeek: completedThisWeek || 0,
        overdueTasks: overdueTasks || 0
      };
    },
    enabled: !!profile?.id
  });

  const { data: upcomingTasks = [] } = useQuery({
    queryKey: ['upcoming-tasks', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          clients(name),
          compliance_categories(name),
          compliance_forms(name)
        `)
        .eq('maker_id', profile.id)
        .in('status', ['pending', 'in_progress'])
        .order('due_date')
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  const { data: recentTimeEntries = [] } = useQuery({
    queryKey: ['recent-time-entries', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          tasks(title, clients(name))
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  if (activeView === 'workspace') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
        <TaskWorkspace />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'in_progress': return 'default';
      case 'ready_for_review': return 'secondary';
      case 'done': return 'default';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Maker Dashboard</h1>
        <Button onClick={() => setActiveView('workspace')}>
          <FileText className="h-4 w-4 mr-2" />
          Open Task Workspace
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
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inProgress || 0}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completedThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.overdueTasks || 0}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Tasks</span>
            </CardTitle>
            <CardDescription>Tasks due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      {task.clients?.name} • {task.compliance_categories?.name}
                      {task.compliance_forms?.name && ` - ${task.compliance_forms.name}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge variant={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No upcoming tasks
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Time Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Time Entries</span>
            </CardTitle>
            <CardDescription>Your latest logged time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTimeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{entry.tasks?.title}</p>
                    <p className="text-sm text-gray-600">{entry.tasks?.clients?.name}</p>
                    <p className="text-xs text-gray-500">{entry.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{entry.duration_hours}h</div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {recentTimeEntries.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No recent time entries
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>This Week's Summary</span>
          </CardTitle>
          <CardDescription>Your performance this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.completedThisWeek || 0}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.inProgress || 0}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {recentTimeEntries.reduce((sum, entry) => sum + (entry.duration_hours || 0), 0).toFixed(1)}h
              </div>
              <div className="text-sm text-gray-600">Hours Logged</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
