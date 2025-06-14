import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  Upload,
  Calendar,
  Play,
  Pause
} from 'lucide-react';
import { useTasks } from '@/contexts/TasksContext';

export const MakerDashboard = () => {
  const { filteredTasks, activeFilter, setActiveFilter, getTaskStats } = useTasks();
  const stats = getTaskStats();

  // Filter tasks assigned to current user (mock - in real app, use auth context)
  const myTasks = filteredTasks.filter(task => 
    task.assignee === 'John Doe' || task.assignee === 'Jane Smith' || task.assignee === 'Mike Johnson'
  );

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <Badge variant="secondary" className="px-3 py-1">
          Maker
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'pending' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleFilterClick('pending')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingTasks}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Today</p>
                <p className="text-3xl font-bold text-gray-900">6.5</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'due-today' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleFilterClick('due-today')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Today</p>
                <p className="text-3xl font-bold text-gray-900">{stats.dueToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Status */}
      {activeFilter !== 'all' && (
        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Badge variant="default">Active Filter</Badge>
            <span className="text-sm text-gray-600">
              Showing {myTasks.length} tasks for: {activeFilter.replace('-', ' ')}
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

      {/* Task Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Task Filters</CardTitle>
          <CardDescription>Filter your tasks by status and priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All My Tasks', filter: 'all' },
              { label: 'Pending', filter: 'pending' },
              { label: 'In Progress', filter: 'in-progress' },
              { label: 'Due Today', filter: 'due-today' },
              { label: 'Overdue', filter: 'overdue' },
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
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeFilter === 'all' ? 'My Assigned Tasks' : `Filtered Tasks (${myTasks.length})`}
          </CardTitle>
          <CardDescription>
            {activeFilter === 'all' 
              ? 'Tasks assigned to you, sorted by due date' 
              : `Tasks filtered by: ${activeFilter.replace('-', ' ')}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myTasks.map((task) => (
              <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.task}</h3>
                    <p className="text-sm text-gray-600">{task.client}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}
                    >
                      {task.priority}
                    </Badge>
                    <Badge 
                      variant={task.status === 'Overdue' ? 'destructive' : 'outline'}
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-1" />
                      Start Timer
                    </Button>
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                    <Button size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {myTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tasks found for the current filter
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
            <CardDescription>Track your work hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">ABC Corp - GSTR-3B</p>
                  <p className="text-sm text-gray-600">Started: 2:30 PM</p>
                </div>
                <Button size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              </div>
              <Button className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start New Timer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent work activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Uploaded documents for XYZ Ltd TDS Return",
                "Completed ABC Corp GSTR-1 Filing",
                "Started work on PQR Inc ROC Filing"
              ].map((activity, index) => (
                <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {activity}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
