
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, User } from 'lucide-react';
import { useUpcomingTasks } from '@/hooks/useUpcomingTasks';
import { useAuth } from '@/hooks/useAuth';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';

export const UpcomingTasksWidget = () => {
  const { data: tasks, isLoading } = useUpcomingTasks();
  const { profile } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Upcoming Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  const getDaysUntilDue = (dueDate: string) => {
    return differenceInDays(new Date(dueDate), new Date());
  };

  const getDueDateBadge = (dueDate: string) => {
    const date = new Date(dueDate);
    const daysUntil = getDaysUntilDue(dueDate);

    if (isToday(date)) {
      return <Badge variant="destructive">Due Today</Badge>;
    } else if (isTomorrow(date)) {
      return <Badge variant="destructive">Due Tomorrow</Badge>;
    } else if (daysUntil <= 3) {
      return <Badge variant="destructive">Due in {daysUntil} days</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge variant="secondary">Due in {daysUntil} days</Badge>;
    } else {
      return <Badge variant="outline">Due {format(date, 'MMM dd')}</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMyRole = (task: any) => {
    if (task.maker_id === profile?.id) return 'Maker';
    if (task.checker_id === profile?.id) return 'Checker';
    return '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Upcoming Tasks ({tasks?.length || 0})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!tasks || tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No upcoming tasks in the next 30 days
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getPriorityIcon(task.priority)}
                      <h4 className="font-medium text-sm">{task.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {task.clients?.name} {task.clients?.client_code && `(${task.clients.client_code})`}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{getMyRole(task)}</span>
                      </span>
                      <span>{task.compliance_categories?.name}</span>
                      <span>{task.compliance_forms?.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getDueDateBadge(task.due_date)}
                    <Badge variant="outline" className="text-xs">
                      {task.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                  </span>
                  <Button size="sm" variant="outline" className="text-xs">
                    View Task
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
