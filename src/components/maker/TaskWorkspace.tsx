
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Clock, Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TaskWorkspace = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [workDialog, setWorkDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [timeEntry, setTimeEntry] = useState({ description: '', duration: 0 });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['maker-tasks', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          clients(name, client_code),
          compliance_categories(name),
          compliance_forms(name),
          checker:user_profiles!tasks_checker_id_fkey(full_name)
        `)
        .eq('maker_id', profile.id)
        .in('status', ['pending', 'in_progress'])
        .order('due_date');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  const { data: taskDocuments = [] } = useQuery({
    queryKey: ['task-documents', selectedTask?.id],
    queryFn: async () => {
      if (!selectedTask?.id) return [];
      const { data, error } = await supabase
        .from('task_documents')
        .select(`
          *,
          documents(filename, file_size, created_at)
        `)
        .eq('task_id', selectedTask.id)
        .eq('is_current', true)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTask?.id
  });

  const { data: taskComments = [] } = useQuery({
    queryKey: ['task-comments', selectedTask?.id],
    queryFn: async () => {
      if (!selectedTask?.id) return [];
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          user_profiles(full_name, role)
        `)
        .eq('task_id', selectedTask.id)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTask?.id
  });

  const startTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'in_progress',
          start_date: new Date().toISOString()
        })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maker-tasks'] });
      toast({ title: "Task started successfully" });
    }
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'ready_for_review',
          end_date: new Date().toISOString()
        })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maker-tasks'] });
      setWorkDialog(false);
      setSelectedTask(null);
      toast({ title: "Task submitted for review" });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const { error } = await supabase
        .from('task_comments')
        .insert([{
          task_id: taskId,
          user_id: profile?.id,
          content,
          comment_type: 'general'
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments'] });
      setComment('');
      toast({ title: "Comment added" });
    }
  });

  const addTimeEntryMutation = useMutation({
    mutationFn: async ({ taskId, description, duration }: { taskId: string; description: string; duration: number }) => {
      const { error } = await supabase
        .from('time_entries')
        .insert([{
          task_id: taskId,
          user_id: profile?.id,
          description,
          duration_hours: duration,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
        }]);
      if (error) throw error;

      // Update task actual hours
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ actual_hours: (selectedTask?.actual_hours || 0) + duration })
        .eq('id', taskId);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maker-tasks'] });
      setTimeEntry({ description: '', duration: 0 });
      toast({ title: "Time entry logged" });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'in_progress': return 'default';
      case 'ready_for_review': return 'secondary';
      case 'done': return 'default';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Tasks</h2>

      <div className="grid gap-4">
        {myTasks.map((task) => (
          <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{task.title}</span>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {task.compliance_categories?.name} 
                    {task.compliance_forms?.name && ` - ${task.compliance_forms.name}`}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {task.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => startTaskMutation.mutate(task.id)}
                    >
                      Start Task
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedTask(task);
                      setWorkDialog(true);
                    }}
                  >
                    Open Workspace
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Client:</strong> {task.clients?.name}</div>
                <div><strong>Due Date:</strong> {new Date(task.due_date).toLocaleDateString()}</div>
                <div><strong>Checker:</strong> {task.checker?.full_name}</div>
                <div><strong>Hours:</strong> {task.actual_hours || 0} / {task.estimated_hours || 0}</div>
              </div>
              {task.description && (
                <div className="mt-2 text-sm text-gray-600">{task.description}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={workDialog} onOpenChange={setWorkDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title} - Workspace</DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <Tabs defaultValue="documents" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="work">Submit Work</TabsTrigger>
                <TabsTrigger value="time">Time Tracking</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Task Documents</h4>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
                <div className="space-y-2">
                  {taskDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>{doc.documents?.filename}</span>
                        <Badge variant="outline">{doc.document_type}</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {doc.documents?.file_size && `${Math.round(doc.documents.file_size / 1024)} KB`}
                      </div>
                    </div>
                  ))}
                  {taskDocuments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No documents uploaded yet
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="work" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-4">Submit Processed Work</h4>
                  <div className="space-y-4">
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Processed Work
                    </Button>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-4">
                        Once you've uploaded your processed work and are ready for review, click the button below.
                      </p>
                      <Button 
                        onClick={() => submitForReviewMutation.mutate(selectedTask.id)}
                        className="w-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit for Review
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="time" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-4">Log Time Entry</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea
                        value={timeEntry.description}
                        onChange={(e) => setTimeEntry({...timeEntry, description: e.target.value})}
                        placeholder="What did you work on?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Duration (hours)</label>
                      <input
                        type="number"
                        step="0.25"
                        value={timeEntry.duration}
                        onChange={(e) => setTimeEntry({...timeEntry, duration: parseFloat(e.target.value)})}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <Button 
                      onClick={() => addTimeEntryMutation.mutate({
                        taskId: selectedTask.id,
                        description: timeEntry.description,
                        duration: timeEntry.duration
                      })}
                      disabled={!timeEntry.description || timeEntry.duration <= 0}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Log Time
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-4">Task Comments</h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {taskComments.map((comment) => (
                      <div key={comment.id} className="p-3 border rounded">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">
                            {comment.user_profiles?.full_name}
                            <Badge variant="outline" className="ml-2">
                              {comment.user_profiles?.role}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm">{comment.content}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => addCommentMutation.mutate({
                        taskId: selectedTask.id,
                        content: comment
                      })}
                      disabled={!comment.trim()}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
