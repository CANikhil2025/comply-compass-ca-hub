
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'maker', 'checker');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'ready_for_review', 'approved', 'filed', 'done', 'overdue');
CREATE TYPE task_type AS ENUM ('compliance', 'adhoc', 'recurring');
CREATE TYPE frequency_type AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');

-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'maker',
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  gstin TEXT,
  pan TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  contact_person TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.user_profiles(id)
);

-- Create compliance_categories table
CREATE TABLE public.compliance_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.user_profiles(id)
);

-- Create compliance_forms table
CREATE TABLE public.compliance_forms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.compliance_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  due_date_offset INTEGER, -- days from month/quarter end
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.user_profiles(id)
);

-- Create client_assignments table
CREATE TABLE public.client_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.compliance_categories(id) ON DELETE CASCADE,
  maker_id UUID REFERENCES public.user_profiles(id),
  checker_id UUID REFERENCES public.user_profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES public.user_profiles(id)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  task_type task_type NOT NULL DEFAULT 'compliance',
  status task_status DEFAULT 'pending',
  client_id UUID REFERENCES public.clients(id),
  category_id UUID REFERENCES public.compliance_categories(id),
  form_id UUID REFERENCES public.compliance_forms(id),
  maker_id UUID REFERENCES public.user_profiles(id),
  checker_id UUID REFERENCES public.user_profiles(id),
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  frequency frequency_type,
  is_recurring BOOLEAN DEFAULT false,
  parent_task_id UUID REFERENCES public.tasks(id),
  total_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.user_profiles(id)
);

-- Create time_entries table
CREATE TABLE public.time_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_hours DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES public.user_profiles(id),
  is_source_data BOOLEAN DEFAULT false,
  is_processed_work BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id),
  content TEXT NOT NULL,
  is_change_request BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  task_id UUID REFERENCES public.tasks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_profiles WHERE id = user_id;
$$;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can insert profiles" ON public.user_profiles FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for clients
CREATE POLICY "All authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage clients" ON public.clients FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for compliance_categories
CREATE POLICY "All authenticated users can view categories" ON public.compliance_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage categories" ON public.compliance_categories FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for compliance_forms
CREATE POLICY "All authenticated users can view forms" ON public.compliance_forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage forms" ON public.compliance_forms FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for client_assignments
CREATE POLICY "All authenticated users can view assignments" ON public.client_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage assignments" ON public.client_assignments FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for tasks
CREATE POLICY "Users can view relevant tasks" ON public.tasks FOR SELECT TO authenticated USING (
  public.get_user_role(auth.uid()) = 'admin' OR 
  maker_id = auth.uid() OR 
  checker_id = auth.uid()
);
CREATE POLICY "Admins and makers can create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (
  public.get_user_role(auth.uid()) IN ('admin', 'maker')
);
CREATE POLICY "Users can update relevant tasks" ON public.tasks FOR UPDATE TO authenticated USING (
  public.get_user_role(auth.uid()) = 'admin' OR 
  maker_id = auth.uid() OR 
  checker_id = auth.uid()
);

-- Create RLS policies for time_entries
CREATE POLICY "Users can view own time entries" ON public.time_entries FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Users can manage own time entries" ON public.time_entries FOR ALL TO authenticated USING (user_id = auth.uid());

-- Create RLS policies for documents
CREATE POLICY "Users can view relevant documents" ON public.documents FOR SELECT TO authenticated USING (
  uploaded_by = auth.uid() OR 
  public.get_user_role(auth.uid()) = 'admin' OR
  EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (maker_id = auth.uid() OR checker_id = auth.uid()))
);
CREATE POLICY "Users can upload documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());

-- Create RLS policies for comments
CREATE POLICY "Users can view relevant comments" ON public.comments FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR 
  public.get_user_role(auth.uid()) = 'admin' OR
  EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (maker_id = auth.uid() OR checker_id = auth.uid()))
);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'maker'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update task status automatically
CREATE OR REPLACE FUNCTION public.update_task_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark tasks as overdue if past due date
  UPDATE public.tasks 
  SET status = 'overdue', updated_at = NOW()
  WHERE due_date < NOW() 
    AND status NOT IN ('done', 'filed', 'overdue');
    
  RETURN NULL;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_tasks_maker_id ON public.tasks(maker_id);
CREATE INDEX idx_tasks_checker_id ON public.tasks(checker_id);
CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_time_entries_task_id ON public.time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_documents_task_id ON public.documents(task_id);
CREATE INDEX idx_comments_task_id ON public.comments(task_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
