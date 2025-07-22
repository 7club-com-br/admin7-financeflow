export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      centros_custo: {
        Row: {
          ativo: boolean | null
          codigo: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contas_financeiras: {
        Row: {
          agencia: string | null
          ativa: boolean | null
          banco: string | null
          conta: string | null
          created_at: string | null
          id: string
          nome: string
          observacoes: string | null
          saldo_atual: number | null
          saldo_inicial: number | null
          tipo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agencia?: string | null
          ativa?: boolean | null
          banco?: string | null
          conta?: string | null
          created_at?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agencia?: string | null
          ativa?: boolean | null
          banco?: string | null
          conta?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financeiro_categorias: {
        Row: {
          ativa: boolean | null
          categoria_pai_id: string | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          categoria_pai_id?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          categoria_pai_id?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_categorias_categoria_pai_id_fkey"
            columns: ["categoria_pai_id"]
            isOneToOne: false
            referencedRelation: "financeiro_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_lancamentos: {
        Row: {
          anexos: Json | null
          categoria_id: string
          centro_custo_id: string | null
          conta_id: string
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          fornecedor_id: string | null
          id: string
          numero_documento: string | null
          observacoes: string | null
          recorrencia_id: string | null
          status: Database["public"]["Enums"]["status_lancamento"] | null
          tags: string[] | null
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at: string | null
          user_id: string
          valor: number
        }
        Insert: {
          anexos?: Json | null
          categoria_id: string
          centro_custo_id?: string | null
          conta_id: string
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          fornecedor_id?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          recorrencia_id?: string | null
          status?: Database["public"]["Enums"]["status_lancamento"] | null
          tags?: string[] | null
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at?: string | null
          user_id: string
          valor: number
        }
        Update: {
          anexos?: Json | null
          categoria_id?: string
          centro_custo_id?: string | null
          conta_id?: string
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          fornecedor_id?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          recorrencia_id?: string | null
          status?: Database["public"]["Enums"]["status_lancamento"] | null
          tags?: string[] | null
          tipo?: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "financeiro_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lancamentos_recorrencia"
            columns: ["recorrencia_id"]
            isOneToOne: false
            referencedRelation: "financeiro_recorrencias"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_recorrencias: {
        Row: {
          ativa: boolean | null
          categoria_id: string
          centro_custo_id: string | null
          conta_id: string
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string
          fornecedor_id: string | null
          frequencia: Database["public"]["Enums"]["frequencia_recorrencia"]
          id: string
          limite_geracoes: number | null
          nome: string
          observacoes: string | null
          proxima_geracao: string | null
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          total_gerado: number | null
          updated_at: string | null
          user_id: string
          valor: number
        }
        Insert: {
          ativa?: boolean | null
          categoria_id: string
          centro_custo_id?: string | null
          conta_id: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao: string
          fornecedor_id?: string | null
          frequencia: Database["public"]["Enums"]["frequencia_recorrencia"]
          id?: string
          limite_geracoes?: number | null
          nome: string
          observacoes?: string | null
          proxima_geracao?: string | null
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          total_gerado?: number | null
          updated_at?: string | null
          user_id: string
          valor: number
        }
        Update: {
          ativa?: boolean | null
          categoria_id?: string
          centro_custo_id?: string | null
          conta_id?: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string
          fornecedor_id?: string | null
          frequencia?: Database["public"]["Enums"]["frequencia_recorrencia"]
          id?: string
          limite_geracoes?: number | null
          nome?: string
          observacoes?: string | null
          proxima_geracao?: string | null
          tipo?: Database["public"]["Enums"]["tipo_lancamento"]
          total_gerado?: number | null
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_recorrencias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "financeiro_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_recorrencias_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_recorrencias_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_recorrencias_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          documento: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          tipo_documento: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          tipo_documento?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          tipo_documento?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      exec_sql: {
        Args: { sql_query: string }
        Returns: undefined
      }
    }
    Enums: {
      frequencia_recorrencia:
        | "diario"
        | "semanal"
        | "quinzenal"
        | "mensal"
        | "bimestral"
        | "trimestral"
        | "semestral"
        | "anual"
      status_lancamento: "pendente" | "pago" | "cancelado" | "atrasado"
      tipo_lancamento: "receita" | "despesa"
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
      frequencia_recorrencia: [
        "diario",
        "semanal",
        "quinzenal",
        "mensal",
        "bimestral",
        "trimestral",
        "semestral",
        "anual",
      ],
      status_lancamento: ["pendente", "pago", "cancelado", "atrasado"],
      tipo_lancamento: ["receita", "despesa"],
    },
  },
} as const
