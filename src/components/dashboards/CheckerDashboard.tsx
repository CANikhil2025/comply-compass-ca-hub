
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, CheckCircle, XCircle } from 'lucide-react';

export const CheckerDashboard = () => {
  // Mock data
  const pendingReviews = [
    { 
      id: '1', 
      title: 'GSTR-3B Filing', 
      client: 'ABC Corp', 
      maker: 'John Doe',
      submittedDate: '2024-01-18', 
      dueDate: '2024-01-20',
      category: 'GST'
    },
    { 
      id: '2', 
      title: 'TDS Return Q3', 
      client: 'XYZ Ltd', 
      maker: 'Jane Smith',
      submittedDate: '2024-01-17', 
      dueDate: '2024-01-25',
      category: 'TDS'
    },
  ];

  const stats = {
    pendingReviews: 5,
    approvedToday: 8,
    totalReviewsThisWeek: 23,
    averageReviewTime: 1.2
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Checker Dashboard</h1>
        <p className="text-gray-600">Tasks awaiting your review and approval</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pendingReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.approvedToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews This Week</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviewsThisWeek}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageReviewTime}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>Tasks submitted for your review and approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingReviews.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-600">{task.client} • {task.category}</div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Submitted by: {task.maker}</span>
                    <span>On: {task.submittedDate}</span>
                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">Ready for Review</Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                  <Button variant="outline" size="sm" className="text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
