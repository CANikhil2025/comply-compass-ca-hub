
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export const AdminDashboard = () => {
  const stats = [
    {
      title: "Active Clients",
      value: "24",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Tasks Due Today",
      value: "8",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Overdue Tasks",
      value: "3",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Completed This Month",
      value: "156",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

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
        {stats.map((stat, index) => (
          <Card key={index}>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Tasks</span>
            </CardTitle>
            <CardDescription>Latest task activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { client: "ABC Corp", task: "GSTR-3B Filing", status: "In Progress", assignee: "John Doe" },
                { client: "XYZ Ltd", task: "TDS Return", status: "Ready for Review", assignee: "Jane Smith" },
                { client: "PQR Inc", task: "ROC Filing", status: "Overdue", assignee: "Mike Johnson" }
              ].map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.client}</p>
                    <p className="text-sm text-gray-600">{task.task}</p>
                    <p className="text-xs text-gray-500">Assigned to: {task.assignee}</p>
                  </div>
                  <Badge 
                    variant={task.status === 'Overdue' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {task.status}
                  </Badge>
                </div>
              ))}
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
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Add New Client",
              "Create Task",
              "View Reports",
              "Manage Users"
            ].map((action, index) => (
              <button
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <p className="font-medium text-gray-900">{action}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
