
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Upload, Play, Pause } from 'lucide-react';
import { useState } from 'react';

export const MakerDashboard = () => {
  const [activeTimer, setActiveTimer] = useState<string | null>(null);

  // Mock data
  const myTasks = [
    { 
      id: '1', 
      title: 'GSTR-3B Filing', 
      client: 'ABC Corp', 
      dueDate: '2024-01-20', 
      status: 'in_progress',
      timeSpent: 4.5,
      category: 'GST'
    },
    { 
      id: '2', 
      title: 'TDS Return Q3', 
      client: 'XYZ Ltd', 
      dueDate: '2024-01-25', 
      status: 'pending',
      timeSpent: 0,
      category: 'TDS'
    },
    { 
      id: '3', 
      title: 'Income Tax Computation', 
      client: 'PQR Inc', 
      dueDate: '2024-01-30', 
      status: 'pending',
      timeSpent: 2.0,
      category: 'Income Tax'
    },
  ];

  const stats = {
    pendingTasks: 8,
    inProgressTasks: 3,
    completedThisWeek: 12,
    totalHoursThisWeek: 34.5
  };

  const toggleTimer = (taskId: string) => {
    if (activeTimer === taskId) {
      setActiveTimer(null);
    } else {
      setActiveTimer(taskId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'default';
      case 'pending': return 'secondary';
      case 'ready_for_review': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Maker Dashboard</h1>
        <p className="text-gray-600">Your assigned tasks and progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.inProgressTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completedThisWeek}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHoursThisWeek}h</div>
          </CardContent>
        </Card>
      </div>

      {/* My Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>Tasks assigned to you, sorted by due date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-600">{task.client} • {task.category}</div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Due: {task.dueDate}</span>
                    <span>Time spent: {task.timeSpent}h</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTimer(task.id)}
                    className="flex items-center space-x-1"
                  >
                    {activeTimer === task.id ? (
                      <><Pause className="h-4 w-4" /><span>Pause</span></>
                    ) : (
                      <><Play className="h-4 w-4" /><span>Start</span></>
                    )}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
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
