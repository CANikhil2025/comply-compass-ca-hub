
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  client_code: string;
  gstin: string;
  pan: string;
  email: string;
  phone: string;
  contact_person: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  business_type: string;
  registration_date: string;
  is_active: boolean;
}

export const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [clientForm, setClientForm] = useState({
    name: '',
    client_code: '',
    gstin: '',
    pan: '',
    email: '',
    phone: '',
    contact_person: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    business_type: '',
    registration_date: ''
  });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const createClientMutation = useMutation({
    mutationFn: async (client: typeof clientForm) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Client created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating client", description: error.message, variant: "destructive" });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: async (client: Client) => {
      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', client.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Client updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating client", description: error.message, variant: "destructive" });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Client deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting client", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setClientForm({
      name: '',
      client_code: '',
      gstin: '',
      pan: '',
      email: '',
      phone: '',
      contact_person: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      business_type: '',
      registration_date: ''
    });
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClientMutation.mutate({ ...editingClient, ...clientForm });
    } else {
      createClientMutation.mutate(clientForm);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name || '',
      client_code: client.client_code || '',
      gstin: client.gstin || '',
      pan: client.pan || '',
      email: client.email || '',
      phone: client.phone || '',
      contact_person: client.contact_person || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      pincode: client.pincode || '',
      business_type: client.business_type || '',
      registration_date: client.registration_date || ''
    });
    setIsDialogOpen(true);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Client Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="client_code">Client Code</Label>
                  <Input
                    id="client_code"
                    value={clientForm.client_code}
                    onChange={(e) => setClientForm({...clientForm, client_code: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={clientForm.gstin}
                    onChange={(e) => setClientForm({...clientForm, gstin: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    value={clientForm.pan}
                    onChange={(e) => setClientForm({...clientForm, pan: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={clientForm.contact_person}
                    onChange={(e) => setClientForm({...clientForm, contact_person: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Select value={clientForm.business_type} onValueChange={(value) => setClientForm({...clientForm, business_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private_limited">Private Limited</SelectItem>
                      <SelectItem value="public_limited">Public Limited</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="proprietorship">Proprietorship</SelectItem>
                      <SelectItem value="llp">LLP</SelectItem>
                      <SelectItem value="trust">Trust</SelectItem>
                      <SelectItem value="society">Society</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({...clientForm, address: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={clientForm.city}
                    onChange={(e) => setClientForm({...clientForm, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={clientForm.state}
                    onChange={(e) => setClientForm({...clientForm, state: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={clientForm.pincode}
                    onChange={(e) => setClientForm({...clientForm, pincode: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="registration_date">Registration Date</Label>
                <Input
                  id="registration_date"
                  type="date"
                  value={clientForm.registration_date}
                  onChange={(e) => setClientForm({...clientForm, registration_date: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingClient ? 'Update' : 'Create'} Client
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div>Loading clients...</div>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{client.name}</span>
                      <Badge variant={client.is_active ? "default" : "secondary"}>
                        {client.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {client.client_code && `Code: ${client.client_code} | `}
                      {client.gstin && `GSTIN: ${client.gstin} | `}
                      {client.pan && `PAN: ${client.pan}`}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => deleteClientMutation.mutate(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Contact:</strong> {client.contact_person}
                  </div>
                  <div>
                    <strong>Email:</strong> {client.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {client.phone}
                  </div>
                  <div>
                    <strong>Business Type:</strong> {client.business_type}
                  </div>
                  <div className="col-span-2">
                    <strong>Address:</strong> {client.address}, {client.city}, {client.state} - {client.pincode}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
