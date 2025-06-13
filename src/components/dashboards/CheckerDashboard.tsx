
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

export const CheckerDashboard = () => {
  const tasksForReview = [
    {
      id: 1,
      client: "ABC Corp",
      task: "GSTR-3B Filing",
      maker: "John Doe",
      submittedAt: "2 hours ago",
      priority: "High"
    },
    {
      id: 2,
      client: "XYZ Ltd",
      task: "TDS Return Q3",
      maker: "Jane Smith",
      submittedAt: "4 hours ago",
      priority: "Medium"
    },
    {
      id: 3,
      client: "DEF Corp",
      task: "ROC Annual Filing",
      maker: "Mike Johnson",
      submittedAt: "1 day ago",
      priority: "Low"
    }
  ];

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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">8</p>
              </div>
              <FileCheck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
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
                <p className="text-3xl font-bold text-gray-900">3</p>
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

      {/* Tasks Awaiting Review */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks Awaiting Review</CardTitle>
          <CardDescription>Submissions from makers ready for your review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasksForReview.map((task) => (
              <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.task}</h3>
                    <p className="text-sm text-gray-600">{task.client}</p>
                    <p className="text-xs text-gray-500">Submitted by: {task.maker}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}
                    >
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">Ready for Review</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Submitted: {task.submittedAt}</p>
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
