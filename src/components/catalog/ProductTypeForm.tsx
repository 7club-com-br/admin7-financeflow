import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const productTypeFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

type ProductTypeFormValues = z.infer<typeof productTypeFormSchema>;

interface ProductTypeFormProps {
  productType?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductTypeForm({ productType, onSuccess, onCancel }: ProductTypeFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductTypeFormValues>({
    resolver: zodResolver(productTypeFormSchema),
    defaultValues: {
      nome: productType?.nome || "",
      descricao: productType?.descricao || "",
      ativo: productType?.ativo ?? true,
    },
  });

  const onSubmit = async (values: ProductTypeFormValues) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const productTypeData = {
        nome: values.nome,
        descricao: values.descricao,
        ativo: values.ativo,
        user_id: user.id,
      };

      let error;
      if (productType?.id) {
        ({ error } = await supabase
          .from('tipos_produtos')
          .update(productTypeData)
          .eq('id', productType.id));
      } else {
        ({ error } = await supabase
          .from('tipos_produtos')
          .insert(productTypeData));
      }

      if (error) throw error;

      toast.success(`Tipo de produto ${productType ? 'atualizado' : 'criado'} com sucesso!`);
      onSuccess();
    } catch (error: any) {
      toast.error(`Erro ao ${productType ? 'atualizar' : 'criar'} tipo de produto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{productType ? 'Editar Tipo de Produto' : 'Novo Tipo de Produto'}</CardTitle>
          <CardDescription>
            {productType ? 'Edite as informações do tipo' : 'Preencha os dados do novo tipo'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do tipo de produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição do tipo de produto"
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
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Tipo Ativo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Tipo estará disponível no sistema
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
                  {loading ? 'Salvando...' : (productType ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}