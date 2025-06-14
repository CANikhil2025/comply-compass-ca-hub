
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

export const ComplianceView = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliant</p>
                <p className="text-3xl font-bold text-green-600">18</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-3xl font-bold text-orange-600">4</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
                <p className="text-3xl font-bold text-red-600">2</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Upcoming Compliance Deadlines</span>
          </CardTitle>
          <CardDescription>Critical deadlines in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { client: "ABC Corp", compliance: "GSTR-3B Filing", deadline: "2024-01-15", priority: "High", daysLeft: 3 },
              { client: "XYZ Ltd", compliance: "TDS Return Q3", deadline: "2024-01-20", priority: "Medium", daysLeft: 8 },
              { client: "PQR Inc", compliance: "ROC Annual Filing", deadline: "2024-01-25", priority: "High", daysLeft: 13 },
              { client: "DEF Corp", compliance: "Income Tax Return", deadline: "2024-01-30", priority: "Low", daysLeft: 18 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.client}</h3>
                  <p className="text-sm text-gray-600">{item.compliance}</p>
                  <p className="text-xs text-gray-500">Due: {item.deadline}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.daysLeft} days left</p>
                    <Badge 
                      variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <Button size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tax Compliance</CardTitle>
            <CardDescription>Status of tax-related compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "GST Returns", compliant: 20, total: 24, percentage: "83%" },
                { type: "TDS Returns", compliant: 22, total: 24, percentage: "92%" },
                { type: "Income Tax", compliant: 18, total: 24, percentage: "75%" },
                { type: "Professional Tax", compliant: 24, total: 24, percentage: "100%" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.type}</p>
                    <p className="text-sm text-gray-500">{item.compliant}/{item.total} clients</p>
                  </div>
                  <Badge 
                    variant={parseInt(item.percentage) >= 90 ? 'default' : parseInt(item.percentage) >= 75 ? 'secondary' : 'destructive'}
                  >
                    {item.percentage}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regulatory Compliance</CardTitle>
            <CardDescription>Status of regulatory filings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "ROC Filings", compliant: 16, total: 24, percentage: "67%" },
                { type: "EPFO Returns", compliant: 21, total: 24, percentage: "88%" },
                { type: "ESI Returns", compliant: 19, total: 24, percentage: "79%" },
                { type: "Labour Compliance", compliant: 23, total: 24, percentage: "96%" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.type}</p>
                    <p className="text-sm text-gray-500">{item.compliant}/{item.total} clients</p>
                  </div>
                  <Badge 
                    variant={parseInt(item.percentage) >= 90 ? 'default' : parseInt(item.percentage) >= 75 ? 'secondary' : 'destructive'}
                  >
                    {item.percentage}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Compliance Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Compliance Activities</CardTitle>
          <CardDescription>Latest compliance-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { activity: "GSTR-1 filed for ABC Corp", timestamp: "2 hours ago", status: "Completed" },
              { activity: "TDS Return Q3 submitted for XYZ Ltd", timestamp: "4 hours ago", status: "Completed" },
              { activity: "ROC Annual Filing reminder sent to PQR Inc", timestamp: "1 day ago", status: "Pending" },
              { activity: "Professional Tax payment processed for DEF Corp", timestamp: "2 days ago", status: "Completed" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.activity}</p>
                  <p className="text-sm text-gray-500">{item.timestamp}</p>
                </div>
                <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
