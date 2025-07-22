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
      cotacoes: {
        Row: {
          created_at: string | null
          data_atualizacao: string | null
          fonte: string | null
          id: string
          moeda: string
          valor_brl: number
        }
        Insert: {
          created_at?: string | null
          data_atualizacao?: string | null
          fonte?: string | null
          id?: string
          moeda: string
          valor_brl: number
        }
        Update: {
          created_at?: string | null
          data_atualizacao?: string | null
          fonte?: string | null
          id?: string
          moeda?: string
          valor_brl?: number
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
      historico_licencas: {
        Row: {
          acao: string
          created_at: string | null
          data_anterior: string | null
          data_nova: string | null
          id: string
          licenca_id: string | null
          metodo_pagamento: string | null
          observacoes: string | null
          plano_id: string | null
          user_id: string
          valor_pago: number | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          data_anterior?: string | null
          data_nova?: string | null
          id?: string
          licenca_id?: string | null
          metodo_pagamento?: string | null
          observacoes?: string | null
          plano_id?: string | null
          user_id: string
          valor_pago?: number | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          data_anterior?: string | null
          data_nova?: string | null
          id?: string
          licenca_id?: string | null
          metodo_pagamento?: string | null
          observacoes?: string | null
          plano_id?: string | null
          user_id?: string
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_licencas_licenca_id_fkey"
            columns: ["licenca_id"]
            isOneToOne: false
            referencedRelation: "licencas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_licencas_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_licenca"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_licencas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      licencas: {
        Row: {
          ativa: boolean | null
          bloqueada: boolean | null
          chave_ativacao: string | null
          chave_licenca: string | null
          created_at: string | null
          data_ativacao: string | null
          data_inicio: string
          data_ultimo_uso: string | null
          data_vencimento: string
          id: string
          limite_lancamentos: number | null
          limite_produtos: number | null
          limite_usuarios: number | null
          motivo_bloqueio: string | null
          plano_id: string | null
          recursos_liberados: Json | null
          status: string | null
          tentativas_uso: number | null
          tipo_plano: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          bloqueada?: boolean | null
          chave_ativacao?: string | null
          chave_licenca?: string | null
          created_at?: string | null
          data_ativacao?: string | null
          data_inicio?: string
          data_ultimo_uso?: string | null
          data_vencimento: string
          id?: string
          limite_lancamentos?: number | null
          limite_produtos?: number | null
          limite_usuarios?: number | null
          motivo_bloqueio?: string | null
          plano_id?: string | null
          recursos_liberados?: Json | null
          status?: string | null
          tentativas_uso?: number | null
          tipo_plano?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          bloqueada?: boolean | null
          chave_ativacao?: string | null
          chave_licenca?: string | null
          created_at?: string | null
          data_ativacao?: string | null
          data_inicio?: string
          data_ultimo_uso?: string | null
          data_vencimento?: string
          id?: string
          limite_lancamentos?: number | null
          limite_produtos?: number | null
          limite_usuarios?: number | null
          motivo_bloqueio?: string | null
          plano_id?: string | null
          recursos_liberados?: Json | null
          status?: string | null
          tentativas_uso?: number | null
          tipo_plano?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "licencas_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_licenca"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licencas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_licenca: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          duracao_meses: number
          id: string
          limite_lancamentos: number | null
          limite_produtos: number | null
          limite_usuarios: number | null
          nome: string
          periodo_trial_dias: number | null
          recursos_liberados: Json | null
          tipo: string
          updated_at: string | null
          valor_brl: number | null
          valor_usd: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          duracao_meses?: number
          id?: string
          limite_lancamentos?: number | null
          limite_produtos?: number | null
          limite_usuarios?: number | null
          nome: string
          periodo_trial_dias?: number | null
          recursos_liberados?: Json | null
          tipo: string
          updated_at?: string | null
          valor_brl?: number | null
          valor_usd?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          duracao_meses?: number
          id?: string
          limite_lancamentos?: number | null
          limite_produtos?: number | null
          limite_usuarios?: number | null
          nome?: string
          periodo_trial_dias?: number | null
          recursos_liberados?: Json | null
          tipo?: string
          updated_at?: string | null
          valor_brl?: number | null
          valor_usd?: number | null
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          tipo_preco: string | null
          tipo_produto_id: string
          updated_at: string | null
          user_id: string
          valor_brl: number | null
          valor_usd: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          tipo_preco?: string | null
          tipo_produto_id: string
          updated_at?: string | null
          user_id: string
          valor_brl?: number | null
          valor_usd?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          tipo_preco?: string | null
          tipo_produto_id?: string
          updated_at?: string | null
          user_id?: string
          valor_brl?: number | null
          valor_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_tipo_produto_id_fkey"
            columns: ["tipo_produto_id"]
            isOneToOne: false
            referencedRelation: "tipos_produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_produtos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tipos_produtos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          id_kommo: string | null
          last_sign_in: string | null
          name: string | null
          role: string | null
          status: string | null
          subdominio: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          id_kommo?: string | null
          last_sign_in?: string | null
          name?: string | null
          role?: string | null
          status?: string | null
          subdominio?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          id_kommo?: string | null
          last_sign_in?: string | null
          name?: string | null
          role?: string | null
          status?: string | null
          subdominio?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ativar_licenca: {
        Args: {
          p_user_id: string
          p_plano_id: string
          p_chave_licenca?: string
          p_meses_adicionais?: number
        }
        Returns: boolean
      }
      atualizar_precos_kommo: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calcular_estatisticas_financeiras: {
        Args: { p_user_id: string; p_data_inicio?: string; p_data_fim?: string }
        Returns: {
          total_receitas: number
          total_despesas: number
          saldo_periodo: number
          receitas_pagas: number
          despesas_pagas: number
          receitas_pendentes: number
          despesas_pendentes: number
        }[]
      }
      exec_sql: {
        Args: { sql_query: string }
        Returns: undefined
      }
      gerar_lancamentos_recorrencias: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      verificar_status_licenca: {
        Args: { p_user_id: string }
        Returns: {
          status: string
          dias_restantes: number
          limite_usuarios: number
          limite_lancamentos: number
          limite_produtos: number
          recursos_liberados: Json
          plano_nome: string
        }[]
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
