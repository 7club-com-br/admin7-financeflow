-- Função para criar dados de demonstração para novos usuários
CREATE OR REPLACE FUNCTION public.criar_dados_demo(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se já existem dados para este usuário
    IF EXISTS (
        SELECT 1 FROM financeiro_lancamentos WHERE user_id = p_user_id
        UNION ALL
        SELECT 1 FROM contas_financeiras WHERE user_id = p_user_id AND nome != 'Conta Principal'
        UNION ALL
        SELECT 1 FROM financeiro_categorias WHERE user_id = p_user_id
        UNION ALL
        SELECT 1 FROM fornecedores WHERE user_id = p_user_id
        UNION ALL
        SELECT 1 FROM produtos WHERE user_id = p_user_id
    ) THEN
        RETURN FALSE; -- Já existem dados, não criar demo
    END IF;

    -- Criar categorias de demonstração
    INSERT INTO financeiro_categorias (user_id, nome, tipo, descricao, cor) VALUES
    (p_user_id, 'Vendas', 'receita', 'Receitas de vendas de produtos/serviços', '#22c55e'),
    (p_user_id, 'Consultoria', 'receita', 'Receitas de consultoria', '#3b82f6'),
    (p_user_id, 'Investimentos', 'receita', 'Rendimentos de investimentos', '#10b981'),
    (p_user_id, 'Escritório', 'despesa', 'Gastos com escritório e infraestrutura', '#ef4444'),
    (p_user_id, 'Marketing', 'despesa', 'Gastos com marketing e publicidade', '#f97316'),
    (p_user_id, 'Impostos', 'despesa', 'Pagamento de impostos', '#dc2626'),
    (p_user_id, 'Salários', 'despesa', 'Folha de pagamento', '#7c2d12');

    -- Criar contas financeiras adicionais
    INSERT INTO contas_financeiras (user_id, nome, tipo, banco, saldo_inicial, saldo_atual) VALUES
    (p_user_id, 'Conta Corrente Principal', 'conta_bancaria', 'Banco do Brasil', 5000.00, 5000.00),
    (p_user_id, 'Poupança', 'poupanca', 'Caixa Econômica', 15000.00, 15000.00),
    (p_user_id, 'Carteira Digital', 'carteira_digital', 'PicPay', 500.00, 500.00);

    -- Criar fornecedores de demonstração
    INSERT INTO fornecedores (user_id, nome, tipo_documento, documento, email, telefone) VALUES
    (p_user_id, 'Tech Solutions Ltda', 'cnpj', '12.345.678/0001-90', 'contato@techsolutions.com', '(11) 99999-1234'),
    (p_user_id, 'Marketing Pro', 'cnpj', '98.765.432/0001-10', 'vendas@marketingpro.com', '(11) 88888-5678'),
    (p_user_id, 'João Silva - Freelancer', 'cpf', '123.456.789-00', 'joao@email.com', '(11) 77777-9012');

    -- Criar centros de custo
    INSERT INTO centros_custo (user_id, nome, codigo, descricao) VALUES
    (p_user_id, 'Administrativo', 'ADM', 'Gastos administrativos gerais'),
    (p_user_id, 'Comercial', 'COM', 'Área comercial e vendas'),
    (p_user_id, 'Tecnologia', 'TEC', 'Área de TI e desenvolvimento');

    -- Criar tipos de produtos
    INSERT INTO tipos_produtos (user_id, nome, descricao) VALUES
    (p_user_id, 'Software', 'Produtos de software e aplicativos'),
    (p_user_id, 'Consultoria', 'Serviços de consultoria'),
    (p_user_id, 'Cursos', 'Cursos online e treinamentos');

    -- Criar produtos de demonstração
    WITH tipo_software AS (SELECT id FROM tipos_produtos WHERE user_id = p_user_id AND nome = 'Software' LIMIT 1),
         tipo_consultoria AS (SELECT id FROM tipos_produtos WHERE user_id = p_user_id AND nome = 'Consultoria' LIMIT 1)
    
    INSERT INTO produtos (user_id, tipo_produto_id, nome, descricao, valor_brl, tipo_preco) VALUES
    (p_user_id, (SELECT id FROM tipo_software), 'Sistema de Gestão Básico', 'Software para pequenas empresas', 299.90, 'fixo'),
    (p_user_id, (SELECT id FROM tipo_software), 'Sistema de Gestão Premium', 'Software completo para médias empresas', 599.90, 'fixo'),
    (p_user_id, (SELECT id FROM tipo_consultoria), 'Consultoria Estratégica', 'Consultoria por hora', 150.00, 'fixo');

    RETURN TRUE;
END;
$$;