
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, Square } from 'lucide-react';

export const TimeTrackingView = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
        <Button>
          <Play className="h-4 w-4 mr-2" />
          Start New Timer
        </Button>
      </div>

      {/* Active Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Active Timer</span>
          </CardTitle>
          <CardDescription>Currently tracking time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">ABC Corp - GSTR-3B Filing</h3>
                <p className="text-sm text-gray-600">Started: 2:30 PM</p>
                <p className="text-lg font-bold text-green-600">02:45:30</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button size="sm" variant="destructive">
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Time Entries</CardTitle>
          <CardDescription>Time tracked for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { client: "ABC Corp", task: "GSTR-3B Filing", duration: "2h 45m", status: "Active" },
              { client: "XYZ Ltd", task: "TDS Return Q3", duration: "1h 30m", status: "Completed" },
              { client: "PQR Inc", task: "ROC Filing", duration: "45m", status: "Completed" }
            ].map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{entry.client}</p>
                  <p className="text-sm text-gray-600">{entry.task}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-gray-900">{entry.duration}</span>
                  <Badge variant={entry.status === 'Active' ? 'default' : 'secondary'}>
                    {entry.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Total Time Today:</span>
              <span className="text-xl font-bold text-blue-600">5h 00m</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardDescription>Weekly time summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Monday</span>
                <span className="font-medium">8h 15m</span>
              </div>
              <div className="flex justify-between">
                <span>Tuesday</span>
                <span className="font-medium">7h 30m</span>
              </div>
              <div className="flex justify-between">
                <span>Wednesday</span>
                <span className="font-medium">6h 45m</span>
              </div>
              <div className="flex justify-between">
                <span>Thursday</span>
                <span className="font-medium">8h 00m</span>
              </div>
              <div className="flex justify-between">
                <span>Today</span>
                <span className="font-medium">5h 00m</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>35h 30m</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
            <CardDescription>Most time spent this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { client: "ABC Corp", time: "12h 30m", percentage: "35%" },
                { client: "XYZ Ltd", time: "10h 15m", percentage: "29%" },
                { client: "PQR Inc", time: "8h 45m", percentage: "25%" },
                { client: "DEF Corp", time: "4h 00m", percentage: "11%" }
              ].map((client, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{client.client}</p>
                    <p className="text-sm text-gray-500">{client.percentage} of total time</p>
                  </div>
                  <span className="font-bold">{client.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
