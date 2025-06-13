-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a simpler function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert the new user profile with error handling
    BEGIN
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
            COALESCE((new.raw_user_meta_data->>'role')::user_role, 'maker'),
            true
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log the error (you can check these in the Supabase logs)
        RAISE LOG 'Error creating user profile: %', SQLERRM;
        -- Re-raise the error
        RAISE;
    END;

    RETURN new;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is properly configured
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow public read access" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.user_profiles;

-- Create new, simpler policies
CREATE POLICY "Enable read for all users" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for users based on id" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id); 