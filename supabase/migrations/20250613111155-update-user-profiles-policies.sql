-- Drop existing insert policy
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;

-- Create new policies for user_profiles
CREATE POLICY "Users can insert their own profile" ON public.user_profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Update the handle_new_user function to use the role from metadata
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
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'maker')
  );
  RETURN new;
END;
$$; 