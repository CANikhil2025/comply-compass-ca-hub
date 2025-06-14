
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
import { FileText, CheckCircle, XCircle, MessageSquare, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ReviewWorkspace = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [reviewType, setReviewType] = useState<'approve' | 'request_changes'>('approve');

  const { data: tasksForReview = [] } = useQuery({
    queryKey: ['checker-tasks', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          clients(name, client_code),
          compliance_categories(name),
          compliance_forms(name),
          maker:user_profiles!tasks_maker_id_fkey(full_name)
        `)
        .eq('checker_id', profile.id)
        .eq('status', 'ready_for_review')
        .order('end_date');
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

  const approveTaskMutation = useMutation({
    mutationFn: async ({ taskId, comment }: { taskId: string; comment?: string }) => {
      // Update task status to approved
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ status: 'approved' })
        .eq('id', taskId);
      if (taskError) throw taskError;

      // Add approval comment
      if (comment) {
        const { error: commentError } = await supabase
          .from('task_comments')
          .insert([{
            task_id: taskId,
            user_id: profile?.id,
            content: comment,
            comment_type: 'approval'
          }]);
        if (commentError) throw commentError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checker-tasks'] });
      setReviewDialog(false);
      setSelectedTask(null);
      setComment('');
      toast({ title: "Task approved successfully" });
    }
  });

  const requestChangesMutation = useMutation({
    mutationFn: async ({ taskId, comment }: { taskId: string; comment: string }) => {
      // Update task status back to in_progress
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', taskId);
      if (taskError) throw taskError;

      // Add change request comment
      const { error: commentError } = await supabase
        .from('task_comments')
        .insert([{
          task_id: taskId,
          user_id: profile?.id,
          content: comment,
          comment_type: 'change_request'
        }]);
      if (commentError) throw commentError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checker-tasks'] });
      setReviewDialog(false);
      setSelectedTask(null);
      setComment('');
      toast({ title: "Change request sent to maker" });
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

  const handleReview = () => {
    if (reviewType === 'approve') {
      approveTaskMutation.mutate({ taskId: selectedTask.id, comment });
    } else {
      if (!comment.trim()) {
        toast({ title: "Please provide feedback for changes", variant: "destructive" });
        return;
      }
      requestChangesMutation.mutate({ taskId: selectedTask.id, comment });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Workspace</h2>

      <div className="grid gap-4">
        {tasksForReview.map((task) => (
          <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{task.title}</span>
                    <Badge variant="secondary">Ready for Review</Badge>
                  </CardTitle>
                  <CardDescription>
                    {task.compliance_categories?.name} 
                    {task.compliance_forms?.name && ` - ${task.compliance_forms.name}`}
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedTask(task);
                    setReviewDialog(true);
                  }}
                >
                  Review Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Client:</strong> {task.clients?.name}</div>
                <div><strong>Maker:</strong> {task.maker?.full_name}</div>
                <div><strong>Submitted:</strong> {new Date(task.end_date).toLocaleDateString()}</div>
                <div><strong>Hours Logged:</strong> {task.actual_hours || 0}</div>
              </div>
              {task.description && (
                <div className="mt-2 text-sm text-gray-600">{task.description}</div>
              )}
            </CardContent>
          </Card>
        ))}

        {tasksForReview.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks to review</h3>
              <p className="text-gray-500">All tasks are up to date!</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title} - Review</DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <Tabs defaultValue="documents" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="review">Review & Approve</TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="space-y-4">
                <h4 className="font-semibold">Submitted Documents</h4>
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
                      No documents submitted yet
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                <h4 className="font-semibold">Task Comments</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {taskComments.map((comment) => (
                    <div key={comment.id} className={`p-3 border rounded ${
                      comment.comment_type === 'change_request' ? 'border-orange-200 bg-orange-50' :
                      comment.comment_type === 'approval' ? 'border-green-200 bg-green-50' : ''
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {comment.user_profiles?.full_name}
                          <Badge variant="outline" className="ml-2">
                            {comment.user_profiles?.role}
                          </Badge>
                          {comment.comment_type !== 'general' && (
                            <Badge variant={comment.comment_type === 'change_request' ? 'destructive' : 'default'} className="ml-2">
                              {comment.comment_type.replace('_', ' ')}
                            </Badge>
                          )}
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
              </TabsContent>

              <TabsContent value="review" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-4">Review & Decision</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Review Decision</label>
                      <div className="flex space-x-4">
                        <Button
                          variant={reviewType === 'approve' ? 'default' : 'outline'}
                          onClick={() => setReviewType('approve')}
                          className="flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          variant={reviewType === 'request_changes' ? 'destructive' : 'outline'}
                          onClick={() => setReviewType('request_changes')}
                          className="flex items-center space-x-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Request Changes</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {reviewType === 'approve' ? 'Approval Comments (Optional)' : 'Change Request Feedback *'}
                      </label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={
                          reviewType === 'approve' 
                            ? "Any additional comments..." 
                            : "Please explain what changes are needed..."
                        }
                        className="min-h-[100px]"
                        required={reviewType === 'request_changes'}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setReviewDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleReview}>
                        <Send className="h-4 w-4 mr-2" />
                        {reviewType === 'approve' ? 'Approve Task' : 'Request Changes'}
                      </Button>
                    </div>
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
