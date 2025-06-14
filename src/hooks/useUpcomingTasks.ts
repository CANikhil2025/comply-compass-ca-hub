
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUpcomingTasks = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['upcoming-tasks', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          clients(name, client_code),
          compliance_categories(name),
          compliance_forms(name),
          maker:user_profiles!tasks_maker_id_fkey(full_name),
          checker:user_profiles!tasks_checker_id_fkey(full_name)
        `)
        .or(`maker_id.eq.${profile.id},checker_id.eq.${profile.id}`)
        .gte('due_date', new Date().toISOString())
        .lte('due_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()) // Next 30 days
        .not('status', 'in', '(done,filed)')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
