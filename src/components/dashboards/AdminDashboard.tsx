
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Calendar, AlertTriangle, RefreshCw, Building } from 'lucide-react';
import { ClientManagement } from '../admin/ClientManagement';
import { ComplianceManagement } from '../admin/ComplianceManagement';
import { ClientAssignments } from '../admin/ClientAssignments';
import { TaskManagement } from '../admin/TaskManagement';
import { UpcomingTasksWidget } from '../tasks/UpcomingTasksWidget';
import { TaskGenerationService } from '@/services/taskGenerationService';
import { useToast } from '@/hooks/use-toast';

type AdminView = 'dashboard' | 'clients' | 'compliance' | 'assignments' | 'tasks';

export const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const { toast } = useToast();

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

  const handleGenerateTasks = async () => {
    setGeneratingTasks(true);
    try {
      await TaskGenerationService.generateAllUpcomingTasks();
      toast({
        title: "Success",
        description: "Tasks generated successfully for all clients",
      });
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast({
        title: "Error",
        description: "Failed to generate tasks",
        variant: "destructive",
      });
    } finally {
      setGeneratingTasks(false);
    }
  };

  if (currentView === 'clients') {
    return <ClientManagement />;
  }

  if (currentView === 'compliance') {
    return <ComplianceManagement />;
  }

  if (currentView === 'assignments') {
    return <ClientAssignments />;
  }

  if (currentView === 'tasks') {
    return <TaskManagement />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button 
          onClick={handleGenerateTasks}
          disabled={generatingTasks}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${generatingTasks ? 'animate-spin' : ''}`} />
          <span>{generatingTasks ? 'Generating...' : 'Generate Tasks'}</span>
        </Button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-2 flex-wrap">
        <Button 
          variant={currentView === 'dashboard' ? 'default' : 'outline'} 
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </Button>
        <Button 
          variant={currentView === 'clients' ? 'default' : 'outline'} 
          onClick={() => setCurrentView('clients')}
        >
          Clients
        </Button>
        <Button 
          variant={currentView === 'compliance' ? 'default' : 'outline'} 
          onClick={() => setCurrentView('compliance')}
        >
          Compliance
        </Button>
        <Button 
          variant={currentView === 'assignments' ? 'default' : 'outline'} 
          onClick={() => setCurrentView('assignments')}
        >
          Assignments
        </Button>
        <Button 
          variant={currentView === 'tasks' ? 'default' : 'outline'} 
          onClick={() => setCurrentView('tasks')}
        >
          Tasks
        </Button>
      </div>

      {/* Dashboard Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Statistics Cards */}
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

      {/* Upcoming Tasks Widget */}
      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingTasksWidget />
        
        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-4">
              Recent activity will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
