export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      client_assignments: {
        Row: {
          assigned_by: string | null
          category_id: string | null
          checker_id: string | null
          client_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          maker_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          category_id?: string | null
          checker_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          maker_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          category_id?: string | null
          checker_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          maker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "compliance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_checker_id_fkey"
            columns: ["checker_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_maker_id_fkey"
            columns: ["maker_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_access: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_access_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          business_type: string | null
          city: string | null
          client_code: string | null
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean | null
          name: string
          pan: string | null
          phone: string | null
          pincode: string | null
          registration_date: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_type?: string | null
          city?: string | null
          client_code?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          registration_date?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_type?: string | null
          city?: string | null
          client_code?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          registration_date?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_change_request: boolean | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_change_request?: boolean | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_change_request?: boolean | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_categories: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_due_dates: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          due_day: number
          due_month: number | null
          form_id: string | null
          frequency: Database["public"]["Enums"]["frequency_type"]
          id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          due_day: number
          due_month?: number | null
          form_id?: string | null
          frequency?: Database["public"]["Enums"]["frequency_type"]
          id?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          due_day?: number
          due_month?: number | null
          form_id?: string | null
          frequency?: Database["public"]["Enums"]["frequency_type"]
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_due_dates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "compliance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_due_dates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_due_dates_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "compliance_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_forms: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date_offset: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date_offset?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date_offset?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_forms_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "compliance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_forms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          is_processed_work: boolean | null
          is_source_data: boolean | null
          mime_type: string | null
          task_id: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          is_processed_work?: boolean | null
          is_source_data?: boolean | null
          mime_type?: string | null
          task_id?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          is_processed_work?: boolean | null
          is_source_data?: boolean | null
          mime_type?: string | null
          task_id?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      government_api_logs: {
        Row: {
          acknowledgement_number: string | null
          api_endpoint: string
          created_at: string | null
          filed_at: string | null
          id: string
          request_payload: Json | null
          response_payload: Json | null
          status_code: number | null
          task_id: string | null
        }
        Insert: {
          acknowledgement_number?: string | null
          api_endpoint: string
          created_at?: string | null
          filed_at?: string | null
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status_code?: number | null
          task_id?: string | null
        }
        Update: {
          acknowledgement_number?: string | null
          api_endpoint?: string
          created_at?: string | null
          filed_at?: string | null
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status_code?: number | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_api_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          client_id: string | null
          created_at: string | null
          days_before: number | null
          event_type: string
          id: string
          is_enabled: boolean | null
          notification_type: string
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          days_before?: number | null
          event_type: string
          id?: string
          is_enabled?: boolean | null
          notification_type: string
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          days_before?: number | null
          event_type?: string
          id?: string
          is_enabled?: boolean | null
          notification_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          task_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          task_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          task_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_task_templates: {
        Row: {
          category_id: string | null
          checker_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          form_id: string | null
          frequency: Database["public"]["Enums"]["frequency_type"]
          id: string
          is_active: boolean | null
          maker_id: string | null
          start_date: string
          title: string
        }
        Insert: {
          category_id?: string | null
          checker_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          form_id?: string | null
          frequency: Database["public"]["Enums"]["frequency_type"]
          id?: string
          is_active?: boolean | null
          maker_id?: string | null
          start_date: string
          title: string
        }
        Update: {
          category_id?: string | null
          checker_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          form_id?: string | null
          frequency?: Database["public"]["Enums"]["frequency_type"]
          id?: string
          is_active?: boolean | null
          maker_id?: string | null
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_task_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "compliance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_task_templates_checker_id_fkey"
            columns: ["checker_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_task_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_task_templates_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "compliance_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_task_templates_maker_id_fkey"
            columns: ["maker_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          comment_type: string | null
          content: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          task_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment_type?: string | null
          content: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment_type?: string | null
          content?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "task_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_documents: {
        Row: {
          document_id: string | null
          document_type: string
          id: string
          is_current: boolean | null
          task_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          document_id?: string | null
          document_type: string
          id?: string
          is_current?: boolean | null
          task_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          document_id?: string | null
          document_type?: string
          id?: string
          is_current?: boolean | null
          task_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "task_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          acknowledgement_number: string | null
          actual_hours: number | null
          category_id: string | null
          checker_id: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          end_date: string | null
          estimated_hours: number | null
          filing_date: string | null
          form_id: string | null
          frequency: Database["public"]["Enums"]["frequency_type"] | null
          government_response: Json | null
          id: string
          is_recurring: boolean | null
          maker_id: string | null
          parent_task_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          acknowledgement_number?: string | null
          actual_hours?: number | null
          category_id?: string | null
          checker_id?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          filing_date?: string | null
          form_id?: string | null
          frequency?: Database["public"]["Enums"]["frequency_type"] | null
          government_response?: Json | null
          id?: string
          is_recurring?: boolean | null
          maker_id?: string | null
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type?: Database["public"]["Enums"]["task_type"]
          title: string
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          acknowledgement_number?: string | null
          actual_hours?: number | null
          category_id?: string | null
          checker_id?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          filing_date?: string | null
          form_id?: string | null
          frequency?: Database["public"]["Enums"]["frequency_type"] | null
          government_response?: Json | null
          id?: string
          is_recurring?: boolean | null
          maker_id?: string | null
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "compliance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_checker_id_fkey"
            columns: ["checker_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "compliance_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_maker_id_fkey"
            columns: ["maker_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string | null
          description: string | null
          duration_hours: number | null
          end_time: string | null
          id: string
          start_time: string
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          end_time?: string | null
          id?: string
          start_time: string
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      frequency_type: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
      task_priority: "low" | "medium" | "high" | "critical"
      task_status:
        | "pending"
        | "in_progress"
        | "ready_for_review"
        | "approved"
        | "filed"
        | "done"
        | "overdue"
      task_type: "compliance" | "adhoc" | "recurring"
      user_role: "admin" | "maker" | "checker"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      frequency_type: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      task_priority: ["low", "medium", "high", "critical"],
      task_status: [
        "pending",
        "in_progress",
        "ready_for_review",
        "approved",
        "filed",
        "done",
        "overdue",
      ],
      task_type: ["compliance", "adhoc", "recurring"],
      user_role: ["admin", "maker", "checker"],
    },
  },
} as const
