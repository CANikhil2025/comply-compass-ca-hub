
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Filter } from 'lucide-react';
import { useTasks } from '@/contexts/TasksContext';

export const TasksView = () => {
  const { filteredTasks, activeFilter, setActiveFilter, getTaskStats } = useTasks();
  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tasks Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'pending' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setActiveFilter('pending')}
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

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'due-today' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setActiveFilter('due-today')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Today</p>
                <p className="text-3xl font-bold text-gray-900">{stats.dueToday}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'overdue' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setActiveFilter('overdue')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
              <FileText className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'completed' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setActiveFilter('completed')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
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

      {/* Task Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Task Filters</span>
          </CardTitle>
          <CardDescription>Filter tasks by status and priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Tasks', filter: 'all' },
              { label: 'Pending', filter: 'pending' },
              { label: 'In Progress', filter: 'in-progress' },
              { label: 'Ready for Review', filter: 'ready-for-review' },
              { label: 'Due Today', filter: 'due-today' },
              { label: 'Overdue', filter: 'overdue' },
              { label: 'High Priority', filter: 'high-priority' },
              { label: 'Completed', filter: 'completed' }
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

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeFilter === 'all' ? 'All Tasks' : `Filtered Tasks (${filteredTasks.length})`}
          </CardTitle>
          <CardDescription>
            {activeFilter === 'all' 
              ? 'Complete list of tasks in the system' 
              : `Tasks filtered by: ${activeFilter.replace('-', ' ')}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.task}</h3>
                    <p className="text-sm text-gray-600">{task.client}</p>
                    <p className="text-xs text-gray-500">Assigned to: {task.assignee}</p>
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
                  <Button size="sm">
                    View Details
                  </Button>
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
    </div>
  );
};
