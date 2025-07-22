import { useState, useEffect } from "react";
import { Edit, Trash2, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface ProductListProps {
  onEdit: (product: any) => void;
}

export function ProductList({ onEdit }: ProductListProps) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        tipos_produtos!inner(nome)
      `)
      .order('nome');

    if (error) {
      toast.error('Erro ao carregar produtos');
      console.error('Error:', error);
    } else {
      setProducts(data || []);
    }
    
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir produto');
    } else {
      toast.success('Produto excluído com sucesso!');
      loadProducts();
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-6 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground text-center">
            Comece criando seu primeiro produto no sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product: any) => (
        <Card key={product.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold truncate">{product.nome}</h3>
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(product)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o produto "{product.nome}"?
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(product.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {product.tipos_produtos?.nome}
                </Badge>
                <Badge 
                  variant={product.tipo_preco === 'kommo' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {product.tipo_preco === 'kommo' ? 'Kommo' : 'Fixo'}
                </Badge>
                <Badge 
                  variant={product.ativo ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {product.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              {product.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.descricao}
                </p>
              )}

              <div className="flex justify-between items-center pt-2">
                <div className="space-y-1">
                  {product.valor_brl && (
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium">
                        {formatCurrency(product.valor_brl)}
                      </span>
                    </div>
                  )}
                  {product.valor_usd && (
                    <div className="text-xs text-muted-foreground">
                      USD ${product.valor_usd}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}