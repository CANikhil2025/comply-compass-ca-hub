
-- Add missing columns to existing tables and create new tables for comprehensive compliance management

-- Update clients table with additional fields
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS client_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS registration_date DATE;

-- Create compliance_due_dates table for defining due dates per category/form
CREATE TABLE IF NOT EXISTS public.compliance_due_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.compliance_categories(id) ON DELETE CASCADE,
  form_id UUID REFERENCES public.compliance_forms(id) ON DELETE CASCADE,
  due_day INTEGER NOT NULL, -- Day of month when due
  due_month INTEGER, -- For annual compliances
  frequency frequency_type NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.user_profiles(id)
);

-- Create task_documents table for better document management
CREATE TABLE IF NOT EXISTS public.task_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'source_data', 'processed_work', 'filing_receipt'
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES public.user_profiles(id)
);

-- Create task_comments table for better comment management
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id),
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'general', -- 'general', 'change_request', 'approval', 'rejection'
  parent_comment_id UUID REFERENCES public.task_comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_portal_access table for client login
CREATE TABLE IF NOT EXISTS public.client_portal_access (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.user_profiles(id)
);

-- Create recurring_task_templates table
CREATE TABLE IF NOT EXISTS public.recurring_task_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.compliance_categories(id),
  form_id UUID REFERENCES public.compliance_forms(id),
  frequency frequency_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  maker_id UUID REFERENCES public.user_profiles(id),
  checker_id UUID REFERENCES public.user_profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.user_profiles(id)
);

-- Create government_api_logs table for tracking filing status
CREATE TABLE IF NOT EXISTS public.government_api_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  api_endpoint TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  status_code INTEGER,
  acknowledgement_number TEXT,
  filed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  client_id UUID REFERENCES public.clients(id),
  notification_type TEXT NOT NULL, -- 'email', 'sms', 'in_app'
  event_type TEXT NOT NULL, -- 'due_date', 'overdue', 'task_assigned', 'status_change'
  days_before INTEGER DEFAULT 3,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add priority enum and update tasks table
DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS priority task_priority DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS filing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS acknowledgement_number TEXT,
ADD COLUMN IF NOT EXISTS government_response JSONB;

-- Enable RLS on new tables
ALTER TABLE public.compliance_due_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Authenticated users can view compliance due dates" ON public.compliance_due_dates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage compliance due dates" ON public.compliance_due_dates FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view relevant task documents" ON public.task_documents FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (maker_id = auth.uid() OR checker_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin'))
);
CREATE POLICY "Users can manage task documents" ON public.task_documents FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (maker_id = auth.uid() OR checker_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin'))
);

CREATE POLICY "Users can view relevant task comments" ON public.task_comments FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (maker_id = auth.uid() OR checker_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin'))
);
CREATE POLICY "Users can create task comments" ON public.task_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage client portal access" ON public.client_portal_access FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage recurring templates" ON public.recurring_task_templates FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view relevant API logs" ON public.government_api_logs FOR SELECT TO authenticated USING (
  public.get_user_role(auth.uid()) = 'admin' OR
  EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (maker_id = auth.uid() OR checker_id = auth.uid()))
);

CREATE POLICY "Users can manage own notifications" ON public.notification_settings FOR ALL TO authenticated USING (user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_compliance_due_dates_category ON public.compliance_due_dates(category_id);
CREATE INDEX IF NOT EXISTS idx_compliance_due_dates_form ON public.compliance_due_dates(form_id);
CREATE INDEX IF NOT EXISTS idx_task_documents_task ON public.task_documents(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_filing_date ON public.tasks(filing_date);

-- Insert sample compliance categories and forms
INSERT INTO public.compliance_categories (name, description, created_by) VALUES
('GST', 'Goods and Services Tax compliance', NULL),
('Income Tax', 'Income Tax compliance filings', NULL),
('TDS', 'Tax Deducted at Source compliance', NULL),
('ROC', 'Registrar of Companies filings', NULL),
('Labour Law', 'Labour and employment law compliance', NULL)
ON CONFLICT DO NOTHING;

-- Get category IDs for forms insertion
DO $$
DECLARE
  gst_id UUID;
  it_id UUID;
  tds_id UUID;
  roc_id UUID;
  labour_id UUID;
BEGIN
  SELECT id INTO gst_id FROM public.compliance_categories WHERE name = 'GST' LIMIT 1;
  SELECT id INTO it_id FROM public.compliance_categories WHERE name = 'Income Tax' LIMIT 1;
  SELECT id INTO tds_id FROM public.compliance_categories WHERE name = 'TDS' LIMIT 1;
  SELECT id INTO roc_id FROM public.compliance_categories WHERE name = 'ROC' LIMIT 1;
  SELECT id INTO labour_id FROM public.compliance_categories WHERE name = 'Labour Law' LIMIT 1;

  -- Insert compliance forms
  INSERT INTO public.compliance_forms (category_id, name, description, due_date_offset) VALUES
  (gst_id, 'GSTR-1', 'Monthly/Quarterly GST Return for outward supplies', 11),
  (gst_id, 'GSTR-3B', 'Monthly/Quarterly GST Return summary', 20),
  (gst_id, 'GSTR-9', 'Annual GST Return', 31),
  (it_id, 'ITR-1', 'Income Tax Return for individuals', 31),
  (it_id, 'ITR-4', 'Income Tax Return for presumptive business', 31),
  (tds_id, 'TDS Return Q1', 'Quarterly TDS Return for Q1', 31),
  (tds_id, 'TDS Return Q2', 'Quarterly TDS Return for Q2', 31),
  (tds_id, 'TDS Return Q3', 'Quarterly TDS Return for Q3', 31),
  (tds_id, 'TDS Return Q4', 'Quarterly TDS Return for Q4', 31),
  (roc_id, 'MGT-7', 'Annual Return to ROC', 60),
  (roc_id, 'AOC-4', 'Annual Filing of Financial Statements', 30),
  (labour_id, 'PF Return', 'Monthly Provident Fund Return', 15)
  ON CONFLICT DO NOTHING;
END $$;
