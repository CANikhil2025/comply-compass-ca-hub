import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileCheck, 
  Clock, 
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Eye
} from 'lucide-react';
import { useTasks } from '@/contexts/TasksContext';

export const CheckerDashboard = () => {
  const { filteredTasks, activeFilter, setActiveFilter, getTaskStats } = useTasks();
  const stats = getTaskStats();

  // Filter tasks that are ready for review
  const tasksForReview = filteredTasks.filter(task => 
    task.status === 'Ready for Review' || activeFilter === 'ready-for-review'
  );

  const handleStatClick = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Review Dashboard</h1>
        <Badge variant="secondary" className="px-3 py-1">
          Checker
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'ready-for-review' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleStatClick('ready-for-review')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingReview}</p>
              </div>
              <FileCheck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'completed' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleStatClick('completed')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Change Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.changeRequests}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Review Time</p>
                <p className="text-3xl font-bold text-gray-900">2.5h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
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
          <CardTitle>Review Filters</CardTitle>
          <CardDescription>Filter tasks by review status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Tasks', filter: 'all' },
              { label: 'Pending Review', filter: 'ready-for-review' },
              { label: 'Completed', filter: 'completed' },
              { label: 'High Priority', filter: 'high-priority' },
              { label: 'Due Today', filter: 'due-today' },
              { label: 'Overdue', filter: 'overdue' }
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

      {/* Tasks Awaiting Review */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeFilter === 'all' ? 'Tasks Awaiting Review' : `Filtered Tasks (${filteredTasks.length})`}
          </CardTitle>
          <CardDescription>
            {activeFilter === 'all' 
              ? 'Submissions from makers ready for your review' 
              : `Tasks filtered by: ${activeFilter.replace('-', ' ')}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(activeFilter === 'all' ? tasksForReview : filteredTasks).map((task) => (
              <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.task}</h3>
                    <p className="text-sm text-gray-600">{task.client}</p>
                    {task.maker && (
                      <p className="text-xs text-gray-500">Submitted by: {task.maker}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}
                    >
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">{task.status}</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <p>Due: {task.dueDate}</p>
                    {task.submittedAt && <p>Submitted: {task.submittedAt}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Comment
                    </Button>
                    <Button size="sm" variant="destructive">
                      Request Changes
                    </Button>
                    <Button size="sm">
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {(activeFilter === 'all' ? tasksForReview : filteredTasks).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tasks found for the current filter
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Your recently completed reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: "PQR Inc - Income Tax", action: "Approved", time: "1 hour ago" },
                { task: "MNO Corp - GST Return", action: "Changes Requested", time: "3 hours ago" },
                { task: "RST Ltd - TDS Filing", action: "Approved", time: "5 hours ago" }
              ].map((review, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{review.task}</p>
                    <p className="text-sm text-gray-500">{review.time}</p>
                  </div>
                  <Badge 
                    variant={review.action === 'Approved' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {review.action}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Quality Metrics</CardTitle>
            <CardDescription>Your review performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accuracy Rate</span>
                <span className="font-bold text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Review Time</span>
                <span className="font-bold">2.3 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reviews This Month</span>
                <span className="font-bold">127</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Change Request Rate</span>
                <span className="font-bold text-orange-600">12%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
