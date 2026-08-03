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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ads: {
        Row: {
          ad_slot: string | null
          business_name: string
          created_at: string | null
          creative_url: string | null
          destination_url: string | null
          end_date: string | null
          id: string
          monthly_rate: number | null
          reference: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          ad_slot?: string | null
          business_name: string
          created_at?: string | null
          creative_url?: string | null
          destination_url?: string | null
          end_date?: string | null
          id: string
          monthly_rate?: number | null
          reference?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          ad_slot?: string | null
          business_name?: string
          created_at?: string | null
          creative_url?: string | null
          destination_url?: string | null
          end_date?: string | null
          id?: string
          monthly_rate?: number | null
          reference?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: []
      }
      artisan_details: {
        Row: {
          bio: string | null
          city: string
          country: string
          currency: string | null
          featured_until: string | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          phone_number: string
          rate: number | null
          state_region: string | null
          trade: string
          updated_at: string
          verification_doc_number: string | null
          verification_doc_type: string | null
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          city: string
          country: string
          currency?: string | null
          featured_until?: string | null
          id: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone_number: string
          rate?: number | null
          state_region?: string | null
          trade: string
          updated_at?: string
          verification_doc_number?: string | null
          verification_doc_type?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          city?: string
          country?: string
          currency?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone_number?: string
          rate?: number | null
          state_region?: string | null
          trade?: string
          updated_at?: string
          verification_doc_number?: string | null
          verification_doc_type?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      artisans: {
        Row: {
          bio: string | null
          business_name: string | null
          created_at: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          jobs_completed: number | null
          location: string
          portfolio_urls: string[] | null
          primary_skill: string
          rating: number | null
          region: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id: string
          jobs_completed?: number | null
          location: string
          portfolio_urls?: string[] | null
          primary_skill: string
          rating?: number | null
          region?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          jobs_completed?: number | null
          location?: string
          portfolio_urls?: string[] | null
          primary_skill?: string
          rating?: number | null
          region?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "artisans_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          artisan_id: string
          cover_letter: string | null
          created_at: string | null
          id: string
          job_id: string
          proposed_timeline: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          artisan_id: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          proposed_timeline: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          artisan_id?: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          proposed_timeline?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount_charged: number
          artisan_id: string | null
          commission_earned: number
          commission_rate: number | null
          created_at: string
          id: string
          job_id: string | null
          status: string | null
        }
        Insert: {
          amount_charged: number
          artisan_id?: string | null
          commission_earned: number
          commission_rate?: number | null
          created_at?: string
          id?: string
          job_id?: string | null
          status?: string | null
        }
        Update: {
          amount_charged?: number
          artisan_id?: string | null
          commission_earned?: number
          commission_rate?: number | null
          created_at?: string
          id?: string
          job_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_support: {
        Row: {
          category: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          message: string
          status: string | null
          subject: string
          ticket_type: string
          user_id: string | null
        }
        Insert: {
          category: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          message: string
          status?: string | null
          subject: string
          ticket_type: string
          user_id?: string | null
        }
        Update: {
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          message?: string
          status?: string | null
          subject?: string
          ticket_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      job_quotes: {
        Row: {
          artisan_id: string
          created_at: string
          currency: string | null
          id: string
          job_id: string
          message: string
          quote_amount: number
        }
        Insert: {
          artisan_id: string
          created_at?: string
          currency?: string | null
          id?: string
          job_id: string
          message: string
          quote_amount: number
        }
        Update: {
          artisan_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          job_id?: string
          message?: string
          quote_amount?: number
        }
        Relationships: []
      }
      jobs: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category: string
          client_id: string | null
          created_at: string | null
          currency: string | null
          description: string
          id: string
          location: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category: string
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          description: string
          id?: string
          location: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category?: string
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string
          id?: string
          location?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          purpose: string
          reference: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          purpose: string
          reference: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          purpose?: string
          reference?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          artisan_id: string
          created_at: string
          id: string
          image_url: string
          title: string | null
        }
        Insert: {
          artisan_id: string
          created_at?: string
          id?: string
          image_url: string
          title?: string | null
        }
        Update: {
          artisan_id?: string
          created_at?: string
          id?: string
          image_url?: string
          title?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          phone_number: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          artisan_id: string
          client_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
        }
        Insert: {
          artisan_id: string
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
        }
        Update: {
          artisan_id?: string
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          status: string | null
          subject: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message: string
          status?: string | null
          subject: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          status?: string | null
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verifications: {
        Row: {
          id: string
          id_document_url: string
          id_type: string
          status: string | null
          submitted_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          id_document_url: string
          id_type: string
          status?: string | null
          submitted_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          id_document_url?: string
          id_type?: string
          status?: string | null
          submitted_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
