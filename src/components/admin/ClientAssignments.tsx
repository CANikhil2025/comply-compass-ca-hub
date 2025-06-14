
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ClientAssignments = () => {
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [assignmentForm, setAssignmentForm] = useState({
    client_id: '',
    category_id: '',
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

  const { data: assignments = [] } = useQuery({
    queryKey: ['client-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_assignments')
        .select(`
          *,
          clients(name, client_code),
          compliance_categories(name),
          maker:user_profiles!client_assignments_maker_id_fkey(full_name),
          checker:user_profiles!client_assignments_checker_id_fkey(full_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (assignment: typeof assignmentForm) => {
      const { data, error } = await supabase
        .from('client_assignments')
        .insert([assignment])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-assignments'] });
      setAssignmentDialog(false);
      setAssignmentForm({ client_id: '', category_id: '', maker_id: '', checker_id: '' });
      toast({ title: "Assignment created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating assignment", description: error.message, variant: "destructive" });
    }
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_assignments')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-assignments'] });
      toast({ title: "Assignment removed successfully" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAssignmentMutation.mutate(assignmentForm);
  };

  // Group assignments by client
  const groupedAssignments = assignments.reduce((acc: any, assignment) => {
    const clientId = assignment.client_id;
    if (!acc[clientId]) {
      acc[clientId] = {
        client: assignment.clients,
        assignments: []
      };
    }
    acc[clientId].assignments.push(assignment);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Client Assignments</h2>
        <Dialog open={assignmentDialog} onOpenChange={setAssignmentDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Client *</label>
                <Select value={assignmentForm.client_id} onValueChange={(value) => setAssignmentForm({...assignmentForm, client_id: value})}>
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
                <label className="block text-sm font-medium mb-1">Compliance Category *</label>
                <Select value={assignmentForm.category_id} onValueChange={(value) => setAssignmentForm({...assignmentForm, category_id: value})}>
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
                <label className="block text-sm font-medium mb-1">Maker *</label>
                <Select value={assignmentForm.maker_id} onValueChange={(value) => setAssignmentForm({...assignmentForm, maker_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maker" />
                  </SelectTrigger>
                  <SelectContent>
                    {makers.map((maker) => (
                      <SelectItem key={maker.id} value={maker.id}>
                        {maker.full_name} ({maker.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Checker *</label>
                <Select value={assignmentForm.checker_id} onValueChange={(value) => setAssignmentForm({...assignmentForm, checker_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select checker" />
                  </SelectTrigger>
                  <SelectContent>
                    {checkers.map((checker) => (
                      <SelectItem key={checker.id} value={checker.id}>
                        {checker.full_name} ({checker.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setAssignmentDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Assignment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedAssignments).map(([clientId, group]: [string, any]) => (
          <Card key={clientId}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{group.client.name}</span>
                {group.client.client_code && (
                  <Badge variant="outline">{group.client.client_code}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {group.assignments.length} compliance assignment{group.assignments.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.assignments.map((assignment: any) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium">{assignment.compliance_categories?.name}</div>
                        <div className="text-sm text-gray-600 flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <UserCheck className="h-3 w-3" />
                            <span>Maker: {assignment.maker?.full_name}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <UserX className="h-3 w-3" />
                            <span>Checker: {assignment.checker?.full_name}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
