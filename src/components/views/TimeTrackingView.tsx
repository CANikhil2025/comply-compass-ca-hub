
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Play, Pause, Square, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TimeTrackingView = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timerDialog, setTimerDialog] = useState(false);
  const [activeTimer, setActiveTimer] = useState<any>(null);

  const [newEntry, setNewEntry] = useState({
    task_id: '',
    description: '',
    duration_hours: 0
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['user-tasks', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          clients(name)
        `)
        .or(`maker_id.eq.${profile.id},checker_id.eq.${profile.id}`)
        .in('status', ['pending', 'in_progress', 'ready_for_review'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  const { data: todayEntries = [] } = useQuery({
    queryKey: ['today-entries', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          tasks(title, clients(name))
        `)
        .eq('user_id', profile.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  const { data: weeklyEntries = [] } = useQuery({
    queryKey: ['weekly-entries', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          tasks(title, clients(name))
        `)
        .eq('user_id', profile.id)
        .gte('created_at', weekStart.toISOString())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (entry: typeof newEntry) => {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([{
          ...entry,
          user_id: profile?.id,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + entry.duration_hours * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-entries'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-entries'] });
      setTimerDialog(false);
      setNewEntry({ task_id: '', description: '', duration_hours: 0 });
      toast({ title: "Time entry logged successfully" });
    }
  });

  const totalTodayHours = todayEntries.reduce((sum, entry) => sum + (entry.duration_hours || 0), 0);
  const totalWeekHours = weeklyEntries.reduce((sum, entry) => sum + (entry.duration_hours || 0), 0);

  // Group weekly entries by day
  const weeklyByDay = weeklyEntries.reduce((acc: any, entry) => {
    const day = new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long' });
    if (!acc[day]) acc[day] = 0;
    acc[day] += entry.duration_hours || 0;
    return acc;
  }, {});

  // Group weekly entries by client
  const weeklyByClient = weeklyEntries.reduce((acc: any, entry) => {
    const clientName = entry.tasks?.clients?.name || 'Unknown Client';
    if (!acc[clientName]) acc[clientName] = 0;
    acc[clientName] += entry.duration_hours || 0;
    return acc;
  }, {});

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
        <Dialog open={timerDialog} onOpenChange={setTimerDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Time Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Time Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              createTimeEntryMutation.mutate(newEntry);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task *</label>
                <Select value={newEntry.task_id} onValueChange={(value) => setNewEntry({...newEntry, task_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    {myTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title} - {task.clients?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                  placeholder="What did you work on?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (hours) *</label>
                <Input
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={newEntry.duration_hours}
                  onChange={(e) => setNewEntry({...newEntry, duration_hours: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setTimerDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!newEntry.task_id || newEntry.duration_hours <= 0}>
                  Log Time
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timer Placeholder - Future Enhancement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Timer (Coming Soon)</span>
          </CardTitle>
          <CardDescription>Live timer functionality will be available in future updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-mono font-bold text-gray-600 mb-4">00:00:00</div>
            <div className="flex justify-center space-x-2">
              <Button disabled variant="outline">
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
              <Button disabled variant="outline">
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button disabled variant="outline">
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Time Entries</CardTitle>
          <CardDescription>Time tracked for today ({new Date().toLocaleDateString()})</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{entry.tasks?.clients?.name || 'Unknown Client'}</p>
                  <p className="text-sm text-gray-600">{entry.tasks?.title}</p>
                  {entry.description && (
                    <p className="text-xs text-gray-500 mt-1">{entry.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-gray-900">{formatHours(entry.duration_hours || 0)}</span>
                  <Badge variant="secondary">
                    {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                </div>
              </div>
            ))}
            {todayEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No time entries logged today
              </div>
            )}
          </div>
          {todayEntries.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Time Today:</span>
                <span className="text-xl font-bold text-blue-600">{formatHours(totalTodayHours)}</span>
              </div>
            </div>
          )}
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
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="flex justify-between">
                  <span className={day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) ? 'font-medium' : ''}>
                    {day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) ? `${day} (Today)` : day}
                  </span>
                  <span className="font-medium">{formatHours(weeklyByDay[day] || 0)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatHours(totalWeekHours)}</span>
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
              {Object.entries(weeklyByClient)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([client, hours]) => {
                  const percentage = totalWeekHours > 0 ? Math.round(((hours as number) / totalWeekHours) * 100) : 0;
                  return (
                    <div key={client} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{client}</p>
                        <p className="text-sm text-gray-500">{percentage}% of total time</p>
                      </div>
                      <span className="font-bold">{formatHours(hours as number)}</span>
                    </div>
                  );
                })}
              {Object.keys(weeklyByClient).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No time entries this week
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
