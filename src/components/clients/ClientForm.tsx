
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  is_active: boolean;
}

interface ClientFormProps {
  client?: Client | null;
  onSaved: () => void;
}

export const ClientForm = ({ client, onSaved }: ClientFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    pan: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        gstin: client.gstin || '',
        pan: client.pan || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        contact_person: client.contact_person || '',
        is_active: client.is_active,
      });
    } else {
      setFormData({
        name: '',
        gstin: '',
        pan: '',
        email: '',
        phone: '',
        address: '',
        contact_person: '',
        is_active: true,
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clientData = {
        ...formData,
        created_by: profile?.id,
        updated_at: new Date().toISOString(),
      };

      if (client) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Client updated successfully",
        });
      } else {
        // Create new client
        const { error } = await supabase
          .from('clients')
          .insert([clientData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Client created successfully",
        });
      }

      onSaved();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Error",
        description: "Failed to save client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            type="text"
            value={formData.contact_person}
            onChange={(e) => handleChange('contact_person', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="gstin">GSTIN</Label>
          <Input
            id="gstin"
            type="text"
            value={formData.gstin}
            onChange={(e) => handleChange('gstin', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pan">PAN</Label>
          <Input
            id="pan"
            type="text"
            value={formData.pan}
            onChange={(e) => handleChange('pan', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleChange('is_active', checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={loading || !formData.name.trim()}
        >
          {loading ? 'Saving...' : (client ? 'Update Client' : 'Create Client')}
        </Button>
      </div>
    </form>
  );
};
