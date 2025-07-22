import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const productFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  tipo_produto_id: z.string().min(1, "Tipo de produto é obrigatório"),
  valor_brl: z.string().optional(),
  valor_usd: z.string().optional(),
  tipo_preco: z.enum(["fixo", "kommo"]).default("fixo"),
  ativo: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nome: product?.nome || "",
      descricao: product?.descricao || "",
      tipo_produto_id: product?.tipo_produto_id || "",
      valor_brl: product?.valor_brl?.toString() || "",
      valor_usd: product?.valor_usd?.toString() || "",
      tipo_preco: product?.tipo_preco || "fixo",
      ativo: product?.ativo ?? true,
    },
  });

  useEffect(() => {
    loadProductTypes();
  }, []);

  const loadProductTypes = async () => {
    const { data, error } = await supabase
      .from('tipos_produtos')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      toast.error('Erro ao carregar tipos de produtos');
      return;
    }

    setProductTypes(data || []);
  };

  const onSubmit = async (values: ProductFormValues) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const productData = {
        nome: values.nome,
        descricao: values.descricao,
        tipo_produto_id: values.tipo_produto_id,
        tipo_preco: values.tipo_preco,
        ativo: values.ativo,
        user_id: user.id,
        valor_brl: values.valor_brl ? parseFloat(values.valor_brl) : null,
        valor_usd: values.valor_usd ? parseFloat(values.valor_usd) : null,
      };

      let error;
      if (product?.id) {
        ({ error } = await supabase
          .from('produtos')
          .update(productData)
          .eq('id', product.id));
      } else {
        ({ error } = await supabase
          .from('produtos')
          .insert(productData));
      }

      if (error) throw error;

      toast.success(`Produto ${product ? 'atualizado' : 'criado'} com sucesso!`);
      onSuccess();
    } catch (error: any) {
      toast.error(`Erro ao ${product ? 'atualizar' : 'criar'} produto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tipoPreco = form.watch("tipo_preco");

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{product ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
          <CardDescription>
            {product ? 'Edite as informações do produto' : 'Preencha os dados do novo produto'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo_produto_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Produto *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productTypes.map((type: any) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição do produto"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Preço</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixo">Preço Fixo</SelectItem>
                        <SelectItem value="kommo">Kommo (Atualização Automática)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valor_brl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Valor em Real (R$)
                        {tipoPreco === "kommo" && " *"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          disabled={tipoPreco === "kommo"}
                        />
                      </FormControl>
                      {tipoPreco === "kommo" && (
                        <p className="text-xs text-muted-foreground">
                          Será calculado automaticamente baseado no valor em dólar
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor_usd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Valor em Dólar (USD)
                        {tipoPreco === "kommo" ? " *" : ""}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      {tipoPreco === "kommo" && (
                        <p className="text-xs text-muted-foreground">
                          Obrigatório para produtos com preço automático
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Produto Ativo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Produto estará disponível no sistema
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (product ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}