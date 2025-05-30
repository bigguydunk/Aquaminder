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
      akuarium: {
        Row: {
          akuarium_id: number
          ikan_id: number | null
          jumlah_ikan_sakit: number | null
          jumlah_ikan_total: number | null
          penyakit_id: number | null
        }
        Insert: {
          akuarium_id?: number
          ikan_id?: number | null
          jumlah_ikan_sakit?: number | null
          jumlah_ikan_total?: number | null
          penyakit_id?: number | null
        }
        Update: {
          akuarium_id?: number
          ikan_id?: number | null
          jumlah_ikan_sakit?: number | null
          jumlah_ikan_total?: number | null
          penyakit_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "akuarium_ikan_id_fkey"
            columns: ["ikan_id"]
            isOneToOne: false
            referencedRelation: "ikan"
            referencedColumns: ["ikan_id"]
          },
          {
            foreignKeyName: "akuarium_penyakit_id_fkey"
            columns: ["penyakit_id"]
            isOneToOne: false
            referencedRelation: "penyakit"
            referencedColumns: ["penyakit_id"]
          },
        ]
      }
      akuarium_penyakit: {
        Row: {
          akuarium_id: number
          penyakit_id: number
        }
        Insert: {
          akuarium_id: number
          penyakit_id: number
        }
        Update: {
          akuarium_id?: number
          penyakit_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "akuarium_penyakit_akuarium_id_fkey"
            columns: ["akuarium_id"]
            isOneToOne: false
            referencedRelation: "akuarium"
            referencedColumns: ["akuarium_id"]
          },
          {
            foreignKeyName: "akuarium_penyakit_penyakit_id_fkey"
            columns: ["penyakit_id"]
            isOneToOne: false
            referencedRelation: "penyakit"
            referencedColumns: ["penyakit_id"]
          },
        ]
      }
      ikan: {
        Row: {
          deskripsi_spesies: string | null
          ikan_id: number
          nama_spesies: string | null
          saran_jadwal_makan: string | null
        }
        Insert: {
          deskripsi_spesies?: string | null
          ikan_id?: number
          nama_spesies?: string | null
          saran_jadwal_makan?: string | null
        }
        Update: {
          deskripsi_spesies?: string | null
          ikan_id?: number
          nama_spesies?: string | null
          saran_jadwal_makan?: string | null
        }
        Relationships: []
      }
      jadwal: {
        Row: {
          akuarium_id: number | null
          created_by: string | null
          jadwal_id: number
          tanggal: string | null
          tugas_id: number | null
          user_id: string | null
        }
        Insert: {
          akuarium_id?: number | null
          created_by?: string | null
          jadwal_id?: number
          tanggal?: string | null
          tugas_id?: number | null
          user_id?: string | null
        }
        Update: {
          akuarium_id?: number | null
          created_by?: string | null
          jadwal_id?: number
          tanggal?: string | null
          tugas_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jadwal_akuarium_id_fkey"
            columns: ["akuarium_id"]
            isOneToOne: false
            referencedRelation: "akuarium"
            referencedColumns: ["akuarium_id"]
          },
          {
            foreignKeyName: "jadwal_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "jadwal_tugas_id_fkey"
            columns: ["tugas_id"]
            isOneToOne: false
            referencedRelation: "tugas"
            referencedColumns: ["tugas_id"]
          },
          {
            foreignKeyName: "jadwal_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      log_pakan: {
        Row: {
          biaya: number | null
          jumlah: number | null
          log_id: number
          pakan_id: number | null
          penjual: number | null
          tanggal_pembelian: string | null
        }
        Insert: {
          biaya?: number | null
          jumlah?: number | null
          log_id?: number
          pakan_id?: number | null
          penjual?: number | null
          tanggal_pembelian?: string | null
        }
        Update: {
          biaya?: number | null
          jumlah?: number | null
          log_id?: number
          pakan_id?: number | null
          penjual?: number | null
          tanggal_pembelian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_penjual_supplier"
            columns: ["penjual"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["supplier_id"]
          },
          {
            foreignKeyName: "log_pakan_pakan_id_fkey"
            columns: ["pakan_id"]
            isOneToOne: false
            referencedRelation: "pakan"
            referencedColumns: ["pakan_id"]
          },
        ]
      }
      pakan: {
        Row: {
          jenis_pakan: string | null
          kuantitas: string | null
          nama_pakan: string | null
          pakan_id: number
        }
        Insert: {
          jenis_pakan?: string | null
          kuantitas?: string | null
          nama_pakan?: string | null
          pakan_id?: number
        }
        Update: {
          jenis_pakan?: string | null
          kuantitas?: string | null
          nama_pakan?: string | null
          pakan_id?: number
        }
        Relationships: []
      }
      penyakit: {
        Row: {
          deskripsi: string | null
          gambar_url: string | null
          gejala: string | null
          nama_penyakit: string | null
          pengobatan: string | null
          penyakit_id: number
          penyebab: string | null
        }
        Insert: {
          deskripsi?: string | null
          gambar_url?: string | null
          gejala?: string | null
          nama_penyakit?: string | null
          pengobatan?: string | null
          penyakit_id?: number
          penyebab?: string | null
        }
        Update: {
          deskripsi?: string | null
          gambar_url?: string | null
          gejala?: string | null
          nama_penyakit?: string | null
          pengobatan?: string | null
          penyakit_id?: number
          penyebab?: string | null
        }
        Relationships: []
      }
      role: {
        Row: {
          description: string
          role_id: number
        }
        Insert: {
          description: string
          role_id: number
        }
        Update: {
          description?: string
          role_id?: number
        }
        Relationships: []
      }
      supplier: {
        Row: {
          contact_information: string | null
          nama_supplier: string | null
          supplier_id: number
        }
        Insert: {
          contact_information?: string | null
          nama_supplier?: string | null
          supplier_id?: number
        }
        Update: {
          contact_information?: string | null
          nama_supplier?: string | null
          supplier_id?: number
        }
        Relationships: []
      }
      tugas: {
        Row: {
          deskripsi_tugas: string | null
          tugas_id: number
        }
        Insert: {
          deskripsi_tugas?: string | null
          tugas_id?: number
        }
        Update: {
          deskripsi_tugas?: string | null
          tugas_id?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          role: number
          user_id: string
          username: string
        }
        Insert: {
          role?: number
          user_id: string
          username: string
        }
        Update: {
          role?: number
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["role_id"]
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
    Enums: {},
  },
} as const
