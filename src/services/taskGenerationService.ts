
import { supabase } from '@/integrations/supabase/client';

interface ComplianceForm {
  id: string;
  name: string;
  category_id: string;
  due_date_offset: number;
}

interface ClientAssignment {
  id: string;
  client_id: string;
  category_id: string;
  maker_id: string;
  checker_id: string;
}

interface ComplianceDueDate {
  id: string;
  category_id: string;
  form_id: string;
  due_day: number;
  due_month?: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
}

export class TaskGenerationService {
  static async generateTasksForClient(clientId: string) {
    try {
      // Get client assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from('client_assignments')
        .select(`
          id, client_id, category_id, maker_id, checker_id,
          compliance_categories(id, name)
        `)
        .eq('client_id', clientId)
        .eq('is_active', true);

      if (assignmentError) throw assignmentError;

      // Get compliance forms for assigned categories
      const categoryIds = assignments?.map(a => a.category_id) || [];
      
      if (categoryIds.length === 0) return;

      const { data: forms, error: formsError } = await supabase
        .from('compliance_forms')
        .select('*')
        .in('category_id', categoryIds)
        .eq('is_active', true);

      if (formsError) throw formsError;

      // Get due date configurations - fix the type by filtering valid frequencies
      const { data: dueDatesRaw, error: dueDatesError } = await supabase
        .from('compliance_due_dates')
        .select('*')
        .in('category_id', categoryIds);

      if (dueDatesError) throw dueDatesError;

      // Filter and map to correct frequency types
      const dueDates: ComplianceDueDate[] = dueDatesRaw?.filter(dd => 
        ['monthly', 'quarterly', 'annually'].includes(dd.frequency)
      ).map(dd => ({
        ...dd,
        frequency: dd.frequency === 'yearly' ? 'annually' as const : dd.frequency as 'monthly' | 'quarterly' | 'annually'
      })) || [];

      // Generate tasks for the next 3 months
      const tasks = [];
      const currentDate = new Date();
      
      for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);
        
        for (const assignment of assignments || []) {
          const categoryForms = forms?.filter(f => f.category_id === assignment.category_id) || [];
          
          for (const form of categoryForms) {
            const dueDate = this.calculateDueDate(form, dueDates, targetDate);
            
            if (dueDate && dueDate > currentDate) {
              // Check if task already exists
              const { data: existingTask } = await supabase
                .from('tasks')
                .select('id')
                .eq('client_id', clientId)
                .eq('form_id', form.id)
                .eq('due_date', dueDate.toISOString())
                .single();

              if (!existingTask) {
                tasks.push({
                  title: `${form.name} - ${assignment.compliance_categories?.name}`,
                  description: `Compliance filing for ${form.name}`,
                  client_id: clientId,
                  category_id: assignment.category_id,
                  form_id: form.id,
                  maker_id: assignment.maker_id,
                  checker_id: assignment.checker_id,
                  due_date: dueDate.toISOString(),
                  status: 'pending',
                  task_type: 'compliance',
                  priority: 'medium',
                  created_by: assignment.id
                });
              }
            }
          }
        }
      }

      if (tasks.length > 0) {
        const { error: insertError } = await supabase
          .from('tasks')
          .insert(tasks);

        if (insertError) throw insertError;
        
        console.log(`Generated ${tasks.length} tasks for client ${clientId}`);
      }

    } catch (error) {
      console.error('Error generating tasks for client:', error);
      throw error;
    }
  }

  private static calculateDueDate(
    form: ComplianceForm, 
    dueDates: ComplianceDueDate[], 
    targetDate: Date
  ): Date | null {
    const dueConfig = dueDates?.find(dd => dd.form_id === form.id || dd.category_id === form.category_id);
    
    if (!dueConfig) {
      // Fallback to form's due_date_offset
      const dueDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0); // Last day of month
      dueDate.setDate(dueDate.getDate() - (30 - (form.due_date_offset || 15)));
      return dueDate;
    }

    let dueDate: Date;

    switch (dueConfig.frequency) {
      case 'monthly':
        dueDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, dueConfig.due_day);
        break;
      case 'quarterly':
        // Generate for quarter end months (March, June, September, December)
        const quarterEndMonths = [2, 5, 8, 11]; // March, June, Sep, Dec (0-indexed)
        if (!quarterEndMonths.includes(targetDate.getMonth())) return null;
        dueDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, dueConfig.due_day);
        break;
      case 'annually':
        if (dueConfig.due_month && targetDate.getMonth() + 1 !== dueConfig.due_month) return null;
        dueDate = new Date(targetDate.getFullYear(), dueConfig.due_month || 3, dueConfig.due_day);
        break;
      default:
        return null;
    }

    return dueDate;
  }

  static async generateAllUpcomingTasks() {
    try {
      // Get all active clients
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id')
        .eq('is_active', true);

      if (error) throw error;

      for (const client of clients || []) {
        await this.generateTasksForClient(client.id);
      }

      console.log('Generated tasks for all clients');
    } catch (error) {
      console.error('Error generating all tasks:', error);
      throw error;
    }
  }
}
