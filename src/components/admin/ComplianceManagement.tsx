
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
import { Plus, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ComplianceManagement = () => {
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [formDialog, setFormDialog] = useState(false);
  const [dueDateDialog, setDueDateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  const [formForm, setFormForm] = useState({
    category_id: '',
    name: '',
    description: '',
    due_date_offset: 0
  });

  const [dueDateForm, setDueDateForm] = useState({
    category_id: '',
    form_id: '',
    due_day: 1,
    due_month: null as number | null,
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['compliance-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_categories')
        .select('*')
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
        .select(`
          *,
          compliance_categories(name)
        `)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: dueDates = [] } = useQuery({
    queryKey: ['compliance-due-dates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_due_dates')
        .select(`
          *,
          compliance_categories(name),
          compliance_forms(name)
        `)
        .order('due_day');
      if (error) throw error;
      return data;
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (category: typeof categoryForm) => {
      const { data, error } = await supabase
        .from('compliance_categories')
        .insert([category])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-categories'] });
      setCategoryDialog(false);
      setCategoryForm({ name: '', description: '' });
      toast({ title: "Category created successfully" });
    }
  });

  const createFormMutation = useMutation({
    mutationFn: async (form: typeof formForm) => {
      const { data, error } = await supabase
        .from('compliance_forms')
        .insert([form])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-forms'] });
      setFormDialog(false);
      setFormForm({ category_id: '', name: '', description: '', due_date_offset: 0 });
      toast({ title: "Form created successfully" });
    }
  });

  const createDueDateMutation = useMutation({
    mutationFn: async (dueDate: typeof dueDateForm) => {
      const { data, error } = await supabase
        .from('compliance_due_dates')
        .insert([dueDate])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-due-dates'] });
      setDueDateDialog(false);
      setDueDateForm({ category_id: '', form_id: '', due_day: 1, due_month: null, frequency: 'monthly' });
      toast({ title: "Due date rule created successfully" });
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Compliance Management</h2>
      
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="due-dates">Due Date Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Compliance Categories</h3>
            <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createCategoryMutation.mutate(categoryForm);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="cat-name">Category Name *</Label>
                    <Input
                      id="cat-name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat-desc">Description</Label>
                    <Textarea
                      id="cat-desc"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCategoryDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Category</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>{category.name}</span>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Compliance Forms</h3>
            <Dialog open={formDialog} onOpenChange={setFormDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Form
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Form</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createFormMutation.mutate(formForm);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="form-category">Category *</Label>
                    <Select value={formForm.category_id} onValueChange={(value) => setFormForm({...formForm, category_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="form-name">Form Name *</Label>
                    <Input
                      id="form-name"
                      value={formForm.name}
                      onChange={(e) => setFormForm({...formForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="form-desc">Description</Label>
                    <Textarea
                      id="form-desc"
                      value={formForm.description}
                      onChange={(e) => setFormForm({...formForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="form-offset">Due Date Offset (days)</Label>
                    <Input
                      id="form-offset"
                      type="number"
                      value={formForm.due_date_offset}
                      onChange={(e) => setFormForm({...formForm, due_date_offset: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setFormDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Form</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4">
            {forms.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>{form.name}</span>
                    </div>
                    <Badge variant="outline">{form.compliance_categories?.name}</Badge>
                  </CardTitle>
                  <CardDescription>{form.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    Due date offset: {form.due_date_offset} days
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="due-dates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Due Date Rules</h3>
            <Dialog open={dueDateDialog} onOpenChange={setDueDateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Due Date Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Due Date Rule</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createDueDateMutation.mutate(dueDateForm);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="dd-category">Category *</Label>
                    <Select value={dueDateForm.category_id} onValueChange={(value) => setDueDateForm({...dueDateForm, category_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dd-form">Form</Label>
                    <Select value={dueDateForm.form_id} onValueChange={(value) => setDueDateForm({...dueDateForm, form_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select form (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {forms.filter(f => f.category_id === dueDateForm.category_id).map((form) => (
                          <SelectItem key={form.id} value={form.id}>{form.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dd-frequency">Frequency *</Label>
                    <Select value={dueDateForm.frequency} onValueChange={(value: any) => setDueDateForm({...dueDateForm, frequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dd-day">Due Day *</Label>
                      <Input
                        id="dd-day"
                        type="number"
                        min="1"
                        max="31"
                        value={dueDateForm.due_day}
                        onChange={(e) => setDueDateForm({...dueDateForm, due_day: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    {dueDateForm.frequency === 'yearly' && (
                      <div>
                        <Label htmlFor="dd-month">Due Month</Label>
                        <Input
                          id="dd-month"
                          type="number"
                          min="1"
                          max="12"
                          value={dueDateForm.due_month || ''}
                          onChange={(e) => setDueDateForm({...dueDateForm, due_month: parseInt(e.target.value)})}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDueDateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Rule</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4">
            {dueDates.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>{rule.compliance_categories?.name}</span>
                      {rule.compliance_forms?.name && (
                        <span className="text-sm text-gray-600">- {rule.compliance_forms.name}</span>
                      )}
                    </div>
                    <Badge variant="outline">{rule.frequency}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    Due: Day {rule.due_day} {rule.due_month && `of month ${rule.due_month}`}
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
