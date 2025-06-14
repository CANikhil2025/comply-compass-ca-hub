
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { useTasks } from '@/contexts/TasksContext';

export const AdminDashboard = () => {
  const { filteredTasks, activeFilter, setActiveFilter, getTaskStats } = useTasks();
  const stats = getTaskStats();

  const statCards = [
    {
      title: "Active Clients",
      value: "24",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      filter: "all"
    },
    {
      title: "Tasks Due Today",
      value: stats.dueToday.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      filter: "due-today"
    },
    {
      title: "Overdue Tasks",
      value: stats.overdue.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      filter: "overdue"
    },
    {
      title: "Completed This Month",
      value: stats.completed.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      filter: "completed"
    }
  ];

  const handleStatClick = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Badge variant="secondary" className="px-3 py-1">
          Administrator
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeFilter === stat.filter ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleStatClick(stat.filter)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Status */}
      {activeFilter !== 'all' && (
        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Badge variant="default">Active Filter</Badge>
            <span className="text-sm text-gray-600">
              Showing {filteredTasks.length} tasks for: {activeFilter.replace('-', ' ')}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            Clear Filter
          </Button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>
                {activeFilter === 'all' ? 'Recent Tasks' : `Filtered Tasks (${filteredTasks.length})`}
              </span>
            </CardTitle>
            <CardDescription>
              {activeFilter === 'all' 
                ? 'Latest task activities' 
                : `Tasks filtered by: ${activeFilter.replace('-', ' ')}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.client}</p>
                    <p className="text-sm text-gray-600">{task.task}</p>
                    <p className="text-xs text-gray-500">Assigned to: {task.assignee}</p>
                    <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge 
                      variant={task.status === 'Overdue' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {task.status}
                    </Badge>
                    <Badge 
                      variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No tasks found for the current filter
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performance Metrics</span>
            </CardTitle>
            <CardDescription>Team performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "John Doe (Maker)", completed: 45, hours: 120, efficiency: "95%" },
                { name: "Jane Smith (Checker)", completed: 38, hours: 95, efficiency: "92%" },
                { name: "Mike Johnson (Maker)", completed: 42, hours: 115, efficiency: "88%" }
              ].map((person, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-900">{person.name}</p>
                    <Badge variant="outline">{person.efficiency}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>Tasks: {person.completed}</div>
                    <div>Hours: {person.hours}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions & Filters</CardTitle>
          <CardDescription>Common administrative tasks and task filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Add New Client",
                "Create Task",
                "View Reports",
                "Manage Users"
              ].map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="p-4 h-auto text-left justify-start"
                >
                  {action}
                </Button>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Task Filters</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'All Tasks', filter: 'all' },
                  { label: 'Due Today', filter: 'due-today' },
                  { label: 'Overdue', filter: 'overdue' },
                  { label: 'In Progress', filter: 'in-progress' },
                  { label: 'Pending Review', filter: 'ready-for-review' },
                  { label: 'High Priority', filter: 'high-priority' }
                ].map((item) => (
                  <Button
                    key={item.filter}
                    variant={activeFilter === item.filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter(item.filter)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
