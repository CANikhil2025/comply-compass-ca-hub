
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Settings,
  UserPlus,
  Building
} from 'lucide-react';
import { ClientManagement } from '@/components/admin/ClientManagement';
import { ComplianceManagement } from '@/components/admin/ComplianceManagement';
import { ClientAssignments } from '@/components/admin/ClientAssignments';
import { TaskManagement } from '@/components/admin/TaskManagement';

export const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');

  // Dashboard statistics queries
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalClients },
        { count: activeUsers },
        { count: totalTasks },
        { count: overdueTasks },
        { count: completedThisMonth }
      ] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('tasks').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
        supabase.from('tasks').select('*', { count: 'exact', head: true })
          .eq('status', 'done')
          .gte('updated_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);
      
      return {
        totalClients: totalClients || 0,
        activeUsers: activeUsers || 0,
        totalTasks: totalTasks || 0,
        overdueTasks: overdueTasks || 0,
        completedThisMonth: completedThisMonth || 0
      };
    }
  });

  const { data: recentTasks = [] } = useQuery({
    queryKey: ['recent-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          clients(name),
          maker:user_profiles!tasks_maker_id_fkey(full_name),
          checker:user_profiles!tasks_checker_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    }
  });

  const { data: upcomingDeadlines = [] } = useQuery({
    queryKey: ['upcoming-deadlines'],
    queryFn: async () => {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          clients(name),
          compliance_categories(name)
        `)
        .lte('due_date', threeDaysFromNow.toISOString())
        .in('status', ['pending', 'in_progress'])
        .order('due_date')
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  if (activeView !== 'dashboard') {
    const viewComponents = {
      clients: <ClientManagement />,
      compliance: <ComplianceManagement />,
      assignments: <ClientAssignments />,
      tasks: <TaskManagement />
    };
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
        {viewComponents[activeView as keyof typeof viewComponents]}
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setActiveView('clients')}>
            <Building className="h-4 w-4 mr-2" />
            Manage Clients
          </Button>
          <Button variant="outline" onClick={() => setActiveView('compliance')}>
            <Settings className="h-4 w-4 mr-2" />
            Compliance Setup
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Makers & Checkers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTasks || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.overdueTasks || 0}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => setActiveView('clients')} className="h-20 flex flex-col">
              <Building className="h-6 w-6 mb-2" />
              Manage Clients
            </Button>
            <Button variant="outline" onClick={() => setActiveView('assignments')} className="h-20 flex flex-col">
              <UserPlus className="h-6 w-6 mb-2" />
              Client Assignments
            </Button>
            <Button variant="outline" onClick={() => setActiveView('tasks')} className="h-20 flex flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Task Management
            </Button>
            <Button variant="outline" onClick={() => setActiveView('compliance')} className="h-20 flex flex-col">
              <Settings className="h-6 w-6 mb-2" />
              Compliance Setup
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Tasks</span>
            </CardTitle>
            <CardDescription>Latest task activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      {task.clients?.name} • {task.maker?.full_name}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No recent tasks
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Upcoming Deadlines</span>
            </CardTitle>
            <CardDescription>Tasks due in the next 3 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      {task.clients?.name} • {task.compliance_categories?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                    <Badge variant={
                      new Date(task.due_date) < new Date() ? 'destructive' : 'outline'
                    }>
                      {new Date(task.due_date) < new Date() ? 'Overdue' : 'Due Soon'}
                    </Badge>
                  </div>
                </div>
              ))}
              {upcomingDeadlines.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No upcoming deadlines
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
            <span>This Month's Performance</span>
          </CardTitle>
          <CardDescription>Key metrics for the current month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.completedThisMonth || 0}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats ? Math.round(((stats.completedThisMonth || 0) / (stats.totalTasks || 1)) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats?.overdueTasks || 0}</div>
              <div className="text-sm text-gray-600">Overdue Tasks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
