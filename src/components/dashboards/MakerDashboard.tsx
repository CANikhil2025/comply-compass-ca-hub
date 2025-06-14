import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { TaskWorkspace } from '../maker/TaskWorkspace';
import { UpcomingTasksWidget } from '../tasks/UpcomingTasksWidget';

export const MakerDashboard = () => {
  const { profile } = useAuth();

  const { data: totalClients, isLoading: clientsLoading } = useQuery({
    queryKey: ['total-clients'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: totalTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['total-tasks'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: completedTasks, isLoading: completedLoading } = useQuery({
    queryKey: ['completed-tasks'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'done');
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: pendingTasks, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-tasks'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (error) throw error;
      return count || 0;
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Maker Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Total Clients</span>
            </CardTitle>
            <CardDescription>All active clients</CardDescription>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="text-2xl font-bold">{totalClients}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Total Tasks</span>
            </CardTitle>
            <CardDescription>All assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="text-2xl font-bold">{totalTasks}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Completed Tasks</span>
            </CardTitle>
            <CardDescription>Tasks marked as done</CardDescription>
          </CardHeader>
          <CardContent>
            {completedLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="text-2xl font-bold">{completedTasks}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Pending Tasks</span>
            </CardTitle>
            <CardDescription>Tasks yet to be completed</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="text-2xl font-bold">{pendingTasks}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Tasks */}
        <UpcomingTasksWidget />
        
        {/* Task Workspace */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your current tasks and workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskWorkspace />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
