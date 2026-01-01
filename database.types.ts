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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          category: string | null
          content_md: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          reading_time_minutes: number | null
          severity: Database["public"]["Enums"]["post_severity"]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content_md?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_time_minutes?: number | null
          severity?: Database["public"]["Enums"]["post_severity"]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content_md?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_time_minutes?: number | null
          severity?: Database["public"]["Enums"]["post_severity"]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          category: string | null
          created_at: string
          credential_id: string | null
          description: string | null
          expires_at: string | null
          id: string
          issuing_org: string | null
          logo_url: string | null
          name: string
          obtained_at: string | null
          pdf_url: string | null
          prestige: number
          updated_at: string
          verify_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          credential_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          issuing_org?: string | null
          logo_url?: string | null
          name: string
          obtained_at?: string | null
          pdf_url?: string | null
          prestige?: number
          updated_at?: string
          verify_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          credential_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          issuing_org?: string | null
          logo_url?: string | null
          name?: string
          obtained_at?: string | null
          pdf_url?: string | null
          prestige?: number
          updated_at?: string
          verify_url?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          url?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
          wants_consult: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          wants_consult?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          wants_consult?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          access_password: string | null
          category: string | null
          content_md: string | null
          created_at: string
          demo_url: string | null
          featured: boolean
          github_url: string | null
          id: string
          security_score: number | null
          slug: string
          status: Database["public"]["Enums"]["project_status"]
          summary: string | null
          tech_stack: string[]
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["project_visibility"]
        }
        Insert: {
          access_password?: string | null
          category?: string | null
          content_md?: string | null
          created_at?: string
          demo_url?: string | null
          featured?: boolean
          github_url?: string | null
          id?: string
          security_score?: number | null
          slug: string
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          tech_stack?: string[]
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["project_visibility"]
        }
        Update: {
          access_password?: string | null
          category?: string | null
          content_md?: string | null
          created_at?: string
          demo_url?: string | null
          featured?: boolean
          github_url?: string | null
          id?: string
          security_score?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          tech_stack?: string[]
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["project_visibility"]
        }
        Relationships: []
      }
      services: {
        Row: {
          bullets: string[]
          created_at: string
          description_md: string | null
          icon: string | null
          id: string
          name: string
          show_on_home: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          bullets?: string[]
          created_at?: string
          description_md?: string | null
          icon?: string | null
          id?: string
          name: string
          show_on_home?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bullets?: string[]
          created_at?: string
          description_md?: string | null
          icon?: string | null
          id?: string
          name?: string
          show_on_home?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: number
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: number
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          proficiency: number
          show_on_home: boolean
          updated_at: string
          years: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          proficiency?: number
          show_on_home?: boolean
          updated_at?: string
          years?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          proficiency?: number
          show_on_home?: boolean
          updated_at?: string
          years?: number | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_name: string
          company: string | null
          created_at: string
          id: string
          photo_url: string | null
          quote: string
          rating: number
          received_at: string | null
          role_title: string | null
          show_on_home: boolean
          updated_at: string
          verified: boolean
        }
        Insert: {
          client_name: string
          company?: string | null
          created_at?: string
          id?: string
          photo_url?: string | null
          quote: string
          rating?: number
          received_at?: string | null
          role_title?: string | null
          show_on_home?: boolean
          updated_at?: string
          verified?: boolean
        }
        Update: {
          client_name?: string
          company?: string | null
          created_at?: string
          id?: string
          photo_url?: string | null
          quote?: string
          rating?: number
          received_at?: string | null
          role_title?: string | null
          show_on_home?: boolean
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_editor_or_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      content_status: "draft" | "published"
      message_status: "new" | "read" | "archived" | "spam"
      post_severity: "critical" | "high" | "medium" | "low"
      project_status: "active" | "archived" | "in_progress"
      project_visibility: "public" | "private" | "password"
      user_role: "admin" | "editor" | "viewer"
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
      content_status: ["draft", "published"],
      message_status: ["new", "read", "archived", "spam"],
      post_severity: ["critical", "high", "medium", "low"],
      project_status: ["active", "archived", "in_progress"],
      project_visibility: ["public", "private", "password"],
      user_role: ["admin", "editor", "viewer"],
    },
  },
} as const
