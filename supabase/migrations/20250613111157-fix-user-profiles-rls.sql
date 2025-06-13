-- First, drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.user_profiles;

-- Temporarily disable RLS
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Create new policies with more permissive rules
CREATE POLICY "Allow public read access" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a new function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role user_role;
BEGIN
    -- Get the role from metadata or default to 'maker'
    user_role := COALESCE(
        (new.raw_user_meta_data->>'role')::user_role,
        'maker'
    );

    -- Insert the new user profile
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        role,
        is_active
    ) VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        user_role,
        true
    );

    RETURN new;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user(); 