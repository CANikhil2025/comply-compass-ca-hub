import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  client_code?: string;
  state?: string;
  city?: string;
  pincode?: string;
  business_type?: string;
  registration_date?: string;
}

interface ComplianceCategory {
  id: string;
  name: string;
  description?: string;
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
    client_code: '',
    state: '',
    city: '',
    pincode: '',
    business_type: '',
    registration_date: '',
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<ComplianceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  // Fetch compliance categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('compliance_categories')
        .select('id, name, description')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    };

    fetchCategories();
  }, []);

  // Load existing client data and their assigned categories
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
        client_code: client.client_code || '',
        state: client.state || '',
        city: client.city || '',
        pincode: client.pincode || '',
        business_type: client.business_type || '',
        registration_date: client.registration_date || '',
      });

      // Fetch existing category assignments
      const fetchClientCategories = async () => {
        const { data, error } = await supabase
          .from('client_assignments')
          .select('category_id')
          .eq('client_id', client.id)
          .eq('is_active', true);
        
        if (error) {
          console.error('Error fetching client categories:', error);
        } else {
          const categoryIds = data?.map(assignment => assignment.category_id) || [];
          setSelectedCategories(categoryIds);
        }
      };

      fetchClientCategories();
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
        client_code: '',
        state: '',
        city: '',
        pincode: '',
        business_type: '',
        registration_date: '',
      });
      setSelectedCategories([]);
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

      let clientId = client?.id;

      if (client) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id);

        if (error) throw error;
      } else {
        // Create new client
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert([clientData])
          .select()
          .single();

        if (error) throw error;
        clientId = newClient.id;
      }

      // Update category assignments
      if (clientId) {
        // First, deactivate existing assignments
        await supabase
          .from('client_assignments')
          .update({ is_active: false })
          .eq('client_id', clientId);

        // Create new assignments for selected categories
        if (selectedCategories.length > 0) {
          const assignments = selectedCategories.map(categoryId => ({
            client_id: clientId,
            category_id: categoryId,
            assigned_by: profile?.id,
            is_active: true
          }));

          const { error: assignmentError } = await supabase
            .from('client_assignments')
            .insert(assignments);

          if (assignmentError) throw assignmentError;
        }
      }

      toast({
        title: "Success",
        description: client ? "Client updated successfully" : "Client created successfully",
      });

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

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev => {
      if (checked) {
        return [...prev, categoryId];
      } else {
        return prev.filter(id => id !== categoryId);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Label htmlFor="client_code">Client Code</Label>
              <Input
                id="client_code"
                type="text"
                value={formData.client_code}
                onChange={(e) => handleChange('client_code', e.target.value)}
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
              <Label htmlFor="business_type">Business Type</Label>
              <Input
                id="business_type"
                type="text"
                value={formData.business_type}
                onChange={(e) => handleChange('business_type', e.target.value)}
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
          
          <div className="mt-4">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                type="text"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="registration_date">Registration Date</Label>
            <Input
              id="registration_date"
              type="date"
              value={formData.registration_date}
              onChange={(e) => handleChange('registration_date', e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Applicable Compliance Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => 
                    handleCategoryToggle(category.id, checked as boolean)
                  }
                />
                <Label htmlFor={category.id} className="text-sm font-medium">
                  {category.name}
                  {category.description && (
                    <span className="text-xs text-gray-500 block">
                      {category.description}
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
