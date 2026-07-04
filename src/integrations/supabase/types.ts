export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          organization: string | null
          phone: string | null
          query_type: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          organization?: string | null
          phone?: string | null
          query_type?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          organization?: string | null
          phone?: string | null
          query_type?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      opportunity_applications: {
        Row: {
          applicant_email: string | null
          applicant_name: string | null
          applicant_phone: string | null
          created_at: string
          id: string
          note: string | null
          opportunity_id: number
          opportunity_kind: string
          opportunity_title: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applicant_email?: string | null
          applicant_name?: string | null
          applicant_phone?: string | null
          created_at?: string
          id?: string
          note?: string | null
          opportunity_id: number
          opportunity_kind: string
          opportunity_title: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applicant_email?: string | null
          applicant_name?: string | null
          applicant_phone?: string | null
          created_at?: string
          id?: string
          note?: string | null
          opportunity_id?: number
          opportunity_kind?: string
          opportunity_title?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          cv_url: string | null
          email: string | null
          extra: Json
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string | null
          extra?: Json
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string | null
          extra?: Json
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          artisan_type: string | null
          business_license: string | null
          corporate_name: string | null
          corporate_type: string | null
          created_at: string
          data: Json
          education_level: string | null
          email: string | null
          employment_status: string | null
          field_of_study: string | null
          full_name: string | null
          id: string
          industries: string[]
          institution_name: string | null
          last_login: string | null
          location: string | null
          looking_for: string[]
          national_id: string | null
          occupation: string | null
          phone: string | null
          professional_experience: string | null
          role: string
          staff_size: string | null
          status: string
          trade: string | null
          updated_at: string
          user_id: string
          user_role: string | null
          verification_fee_paid: boolean
          verified: boolean
          years_experience: string | null
        }
        Insert: {
          artisan_type?: string | null
          business_license?: string | null
          corporate_name?: string | null
          corporate_type?: string | null
          created_at?: string
          data?: Json
          education_level?: string | null
          email?: string | null
          employment_status?: string | null
          field_of_study?: string | null
          full_name?: string | null
          id?: string
          industries?: string[]
          institution_name?: string | null
          last_login?: string | null
          location?: string | null
          looking_for?: string[]
          national_id?: string | null
          occupation?: string | null
          phone?: string | null
          professional_experience?: string | null
          role: string
          staff_size?: string | null
          status?: string
          trade?: string | null
          updated_at?: string
          user_id: string
          user_role?: string | null
          verification_fee_paid?: boolean
          verified?: boolean
          years_experience?: string | null
        }
        Update: {
          artisan_type?: string | null
          business_license?: string | null
          corporate_name?: string | null
          corporate_type?: string | null
          created_at?: string
          data?: Json
          education_level?: string | null
          email?: string | null
          employment_status?: string | null
          field_of_study?: string | null
          full_name?: string | null
          id?: string
          industries?: string[]
          institution_name?: string | null
          last_login?: string | null
          location?: string | null
          looking_for?: string[]
          national_id?: string | null
          occupation?: string | null
          phone?: string | null
          professional_experience?: string | null
          role?: string
          staff_size?: string | null
          status?: string
          trade?: string | null
          updated_at?: string
          user_id?: string
          user_role?: string | null
          verification_fee_paid?: boolean
          verified?: boolean
          years_experience?: string | null
        }
        Relationships: []
      }
      role_containers: {
        Row: {
          container_id: string
          container_type: string
          created_at: string
          display_name: string
          member_count: number
        }
        Insert: {
          container_id?: string
          container_type: string
          created_at?: string
          display_name: string
          member_count?: number
        }
        Update: {
          container_id?: string
          container_type?: string
          created_at?: string
          display_name?: string
          member_count?: number
        }
        Relationships: []
      }
      user_container_memberships: {
        Row: {
          container_id: string
          joined_at: string
          membership_id: string
          user_id: string
        }
        Insert: {
          container_id: string
          joined_at?: string
          membership_id?: string
          user_id: string
        }
        Update: {
          container_id?: string
          joined_at?: string
          membership_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_container_memberships_container_id_fkey"
            columns: ["container_id"]
            isOneToOne: false
            referencedRelation: "role_containers"
            referencedColumns: ["container_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      container_type_for: {
        Args: { _artisan_type: string; _user_role: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
