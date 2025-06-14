
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Repeat, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TaskManagement = () => {
  const [adhocDialog, setAdhocDialog] = useState(false);
  const [recurringDialog, setRecurringDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [adhocForm, setAdhocForm] = useState({
    title: '',
    description: '',
    client_id: '',
    maker_id: '',
    checker_id: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    estimated_hours: 0
  });

  const [recurringForm, setRecurringForm] = useState({
    title: '',
    description: '',
    category_id: '',
    form_id: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    start_date: '',
    end_date: '',
    maker_id: '',
    checker_id: ''
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, client_code')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['compliance-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: forms = [] } = useQuery({
    queryKey: ['compliance-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_forms')
        .select('id, name, category_id')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: makers = [] } = useQuery({
    queryKey: ['makers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'maker')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    }
  });

  const { data: checkers = [] } = useQuery({
    queryKey: ['checkers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'checker')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    }
  });

  const { data: adhocTasks = [] } = useQuery({
    queryKey: ['adhoc-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          clients(name, client_code),
          maker:user_profiles!tasks_maker_id_fkey(full_name),
          checker:user_profiles!tasks_checker_id_fkey(full_name)
        `)
        .eq('task_type', 'adhoc')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: recurringTemplates = [] } = useQuery({
    queryKey: ['recurring-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_task_templates')
        .select(`
          *,
          compliance_categories(name),
          compliance_forms(name),
          maker:user_profiles!recurring_task_templates_maker_id_fkey(full_name),
          checker:user_profiles!recurring_task_templates_checker_id_fkey(full_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createAdhocTaskMutation = useMutation({
    mutationFn: async (task: typeof adhocForm) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          task_type: 'adhoc',
          status: 'pending'
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adhoc-tasks'] });
      setAdhocDialog(false);
      setAdhocForm({
        title: '',
        description: '',
        client_id: '',
        maker_id: '',
        checker_id: '',
        due_date: '',
        priority: 'medium',
        estimated_hours: 0
      });
      toast({ title: "Adhoc task created successfully" });
    }
  });

  const createRecurringTemplateMutation = useMutation({
    mutationFn: async (template: typeof recurringForm) => {
      const { data, error } = await supabase
        .from('recurring_task_templates')
        .insert([template])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-templates'] });
      setRecurringDialog(false);
      setRecurringForm({
        title: '',
        description: '',
        category_id: '',
        form_id: '',
        frequency: 'monthly',
        start_date: '',
        end_date: '',
        maker_id: '',
        checker_id: ''
      });
      toast({ title: "Recurring template created successfully" });
    }
  });

  const filteredForms = forms.filter(form => form.category_id === recurringForm.category_id);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Task Management</h2>
      
      <Tabs defaultValue="adhoc" className="space-y-4">
        <TabsList>
          <TabsTrigger value="adhoc">Ad-hoc Tasks</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="adhoc" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Ad-hoc Tasks</h3>
            <Dialog open={adhocDialog} onOpenChange={setAdhocDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ad-hoc Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Ad-hoc Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createAdhocTaskMutation.mutate(adhocForm);
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="adhoc-title">Task Title *</Label>
                      <Input
                        id="adhoc-title"
                        value={adhocForm.title}
                        onChange={(e) => setAdhocForm({...adhocForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="adhoc-desc">Description</Label>
                      <Textarea
                        id="adhoc-desc"
                        value={adhocForm.description}
                        onChange={(e) => setAdhocForm({...adhocForm, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="adhoc-client">Client *</Label>
                      <Select value={adhocForm.client_id} onValueChange={(value) => setAdhocForm({...adhocForm, client_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} {client.client_code && `(${client.client_code})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="adhoc-due">Due Date *</Label>
                      <Input
                        id="adhoc-due"
                        type="datetime-local"
                        value={adhocForm.due_date}
                        onChange={(e) => setAdhocForm({...adhocForm, due_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="adhoc-maker">Maker *</Label>
                      <Select value={adhocForm.maker_id} onValueChange={(value) => setAdhocForm({...adhocForm, maker_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select maker" />
                        </SelectTrigger>
                        <SelectContent>
                          {makers.map((maker) => (
                            <SelectItem key={maker.id} value={maker.id}>
                              {maker.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="adhoc-checker">Checker *</Label>
                      <Select value={adhocForm.checker_id} onValueChange={(value) => setAdhocForm({...adhocForm, checker_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select checker" />
                        </SelectTrigger>
                        <SelectContent>
                          {checkers.map((checker) => (
                            <SelectItem key={checker.id} value={checker.id}>
                              {checker.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="adhoc-priority">Priority</Label>
                      <Select value={adhocForm.priority} onValueChange={(value: any) => setAdhocForm({...adhocForm, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="adhoc-hours">Estimated Hours</Label>
                      <Input
                        id="adhoc-hours"
                        type="number"
                        step="0.5"
                        value={adhocForm.estimated_hours}
                        onChange={(e) => setAdhocForm({...adhocForm, estimated_hours: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setAdhocDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Task</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4">
            {adhocTasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>{task.title}</span>
                        <Badge variant={
                          task.priority === 'critical' ? 'destructive' :
                          task.priority === 'high' ? 'default' :
                          task.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {task.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                    <Badge variant={
                      task.status === 'done' ? 'default' :
                      task.status === 'overdue' ? 'destructive' : 'secondary'
                    }>
                      {task.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Client:</strong> {task.clients?.name}</div>
                    <div><strong>Due Date:</strong> {new Date(task.due_date).toLocaleString()}</div>
                    <div><strong>Maker:</strong> {task.maker?.full_name}</div>
                    <div><strong>Checker:</strong> {task.checker?.full_name}</div>
                    {task.estimated_hours > 0 && (
                      <div><strong>Estimated Hours:</strong> {task.estimated_hours}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recurring Task Templates</h3>
            <Dialog open={recurringDialog} onOpenChange={setRecurringDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recurring Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Recurring Template</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createRecurringTemplateMutation.mutate(recurringForm);
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="rec-title">Template Title *</Label>
                      <Input
                        id="rec-title"
                        value={recurringForm.title}
                        onChange={(e) => setRecurringForm({...recurringForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="rec-desc">Description</Label>
                      <Textarea
                        id="rec-desc"
                        value={recurringForm.description}
                        onChange={(e) => setRecurringForm({...recurringForm, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rec-category">Category *</Label>
                      <Select value={recurringForm.category_id} onValueChange={(value) => setRecurringForm({...recurringForm, category_id: value, form_id: ''})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rec-form">Form</Label>
                      <Select value={recurringForm.form_id} onValueChange={(value) => setRecurringForm({...recurringForm, form_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select form (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredForms.map((form) => (
                            <SelectItem key={form.id} value={form.id}>
                              {form.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rec-frequency">Frequency *</Label>
                      <Select value={recurringForm.frequency} onValueChange={(value: any) => setRecurringForm({...recurringForm, frequency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rec-start">Start Date *</Label>
                      <Input
                        id="rec-start"
                        type="date"
                        value={recurringForm.start_date}
                        onChange={(e) => setRecurringForm({...recurringForm, start_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rec-end">End Date</Label>
                      <Input
                        id="rec-end"
                        type="date"
                        value={recurringForm.end_date}
                        onChange={(e) => setRecurringForm({...recurringForm, end_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rec-maker">Default Maker</Label>
                      <Select value={recurringForm.maker_id} onValueChange={(value) => setRecurringForm({...recurringForm, maker_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select maker" />
                        </SelectTrigger>
                        <SelectContent>
                          {makers.map((maker) => (
                            <SelectItem key={maker.id} value={maker.id}>
                              {maker.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rec-checker">Default Checker</Label>
                      <Select value={recurringForm.checker_id} onValueChange={(value) => setRecurringForm({...recurringForm, checker_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select checker" />
                        </SelectTrigger>
                        <SelectContent>
                          {checkers.map((checker) => (
                            <SelectItem key={checker.id} value={checker.id}>
                              {checker.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setRecurringDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Template</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4">
            {recurringTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Repeat className="h-5 w-5" />
                    <span>{template.title}</span>
                    <Badge variant="outline">{template.frequency}</Badge>
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Category:</strong> {template.compliance_categories?.name}</div>
                    <div><strong>Form:</strong> {template.compliance_forms?.name || 'Any'}</div>
                    <div><strong>Start Date:</strong> {new Date(template.start_date).toLocaleDateString()}</div>
                    <div><strong>End Date:</strong> {template.end_date ? new Date(template.end_date).toLocaleDateString() : 'Ongoing'}</div>
                    <div><strong>Default Maker:</strong> {template.maker?.full_name || 'Not set'}</div>
                    <div><strong>Default Checker:</strong> {template.checker?.full_name || 'Not set'}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
