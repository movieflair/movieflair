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
      admin_movies: {
        Row: {
          backdrop_path: string | null
          created_at: string | null
          hasstream: boolean | null
          hastrailer: boolean | null
          id: number
          isfreemovie: boolean | null
          isnewtrailer: boolean | null
          media_type: string
          overview: string | null
          popularity: number | null
          poster_path: string | null
          release_date: string | null
          runtime: number | null
          streamurl: string | null
          title: string
          trailerurl: string | null
          updated_at: string | null
          vote_average: number | null
          vote_count: number | null
        }
        Insert: {
          backdrop_path?: string | null
          created_at?: string | null
          hasstream?: boolean | null
          hastrailer?: boolean | null
          id: number
          isfreemovie?: boolean | null
          isnewtrailer?: boolean | null
          media_type?: string
          overview?: string | null
          popularity?: number | null
          poster_path?: string | null
          release_date?: string | null
          runtime?: number | null
          streamurl?: string | null
          title: string
          trailerurl?: string | null
          updated_at?: string | null
          vote_average?: number | null
          vote_count?: number | null
        }
        Update: {
          backdrop_path?: string | null
          created_at?: string | null
          hasstream?: boolean | null
          hastrailer?: boolean | null
          id?: number
          isfreemovie?: boolean | null
          isnewtrailer?: boolean | null
          media_type?: string
          overview?: string | null
          popularity?: number | null
          poster_path?: string | null
          release_date?: string | null
          runtime?: number | null
          streamurl?: string | null
          title?: string
          trailerurl?: string | null
          updated_at?: string | null
          vote_average?: number | null
          vote_count?: number | null
        }
        Relationships: []
      }
      admin_shows: {
        Row: {
          backdrop_path: string | null
          created_at: string | null
          first_air_date: string | null
          hasstream: boolean | null
          hastrailer: boolean | null
          id: number
          media_type: string
          name: string
          overview: string | null
          popularity: number | null
          poster_path: string | null
          streamurl: string | null
          trailerurl: string | null
          updated_at: string | null
          vote_average: number | null
          vote_count: number | null
        }
        Insert: {
          backdrop_path?: string | null
          created_at?: string | null
          first_air_date?: string | null
          hasstream?: boolean | null
          hastrailer?: boolean | null
          id: number
          media_type?: string
          name: string
          overview?: string | null
          popularity?: number | null
          poster_path?: string | null
          streamurl?: string | null
          trailerurl?: string | null
          updated_at?: string | null
          vote_average?: number | null
          vote_count?: number | null
        }
        Update: {
          backdrop_path?: string | null
          created_at?: string | null
          first_air_date?: string | null
          hasstream?: boolean | null
          hastrailer?: boolean | null
          id?: number
          media_type?: string
          name?: string
          overview?: string | null
          popularity?: number | null
          poster_path?: string | null
          streamurl?: string | null
          trailerurl?: string | null
          updated_at?: string | null
          vote_average?: number | null
          vote_count?: number | null
        }
        Relationships: []
      }
      custom_lists: {
        Row: {
          created_at: string | null
          createdat: string | null
          description: string | null
          id: string
          movies: Json | null
          title: string
          updated_at: string | null
          updatedat: string | null
        }
        Insert: {
          created_at?: string | null
          createdat?: string | null
          description?: string | null
          id?: string
          movies?: Json | null
          title: string
          updated_at?: string | null
          updatedat?: string | null
        }
        Update: {
          created_at?: string | null
          createdat?: string | null
          description?: string | null
          id?: string
          movies?: Json | null
          title?: string
          updated_at?: string | null
          updatedat?: string | null
        }
        Relationships: []
      }
      feedback_stats: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          page: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          page: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          page?: string
        }
        Relationships: []
      }
      filter_recommendations: {
        Row: {
          created_at: string
          id: number
          movie_data: Json
          movie_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          movie_data: Json
          movie_id: number
        }
        Update: {
          created_at?: string
          id?: number
          movie_data?: Json
          movie_id?: number
        }
        Relationships: []
      }
      interaction_stats: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          interaction_type: string
          is_admin: boolean | null
          media_id: number | null
          media_type: string | null
          referrer: string | null
          user_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          is_admin?: boolean | null
          media_id?: number | null
          media_type?: string | null
          referrer?: string | null
          user_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          is_admin?: boolean | null
          media_id?: number | null
          media_type?: string | null
          referrer?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      quick_tipp_ratings: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          movie_id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          movie_id: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          movie_id?: number
          user_id?: string | null
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      watchlist: {
        Row: {
          added_at: string | null
          id: string
          media_id: number
          media_type: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          media_id: number
          media_type: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          media_id?: number
          media_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
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
      app_role: ["admin", "user"],
    },
  },
} as const
