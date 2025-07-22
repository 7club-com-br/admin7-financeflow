import { useState, useEffect } from "react";
import { Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProductTypeListProps {
  onEdit: (productType: any) => void;
}

export function ProductTypeList({ onEdit }: ProductTypeListProps) {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductTypes();
  }, []);

  const loadProductTypes = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('tipos_produtos')
      .select('*')
      .order('nome');

    if (error) {
      toast.error('Erro ao carregar tipos de produtos');
      console.error('Error:', error);
    } else {
      setProductTypes(data || []);
    }
    
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('tipos_produtos')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir tipo de produto');
    } else {
      toast.success('Tipo de produto excluído com sucesso!');
      loadProductTypes();
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (productTypes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Tag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum tipo encontrado</h3>
          <p className="text-muted-foreground text-center">
            Comece criando seu primeiro tipo de produto.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {productTypes.map((productType: any) => (
        <Card key={productType.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold truncate">{productType.nome}</h3>
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(productType)}
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
                        Tem certeza que deseja excluir o tipo "{productType.nome}"?
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(productType.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="space-y-2">
              <Badge 
                variant={productType.ativo ? 'default' : 'secondary'}
                className="text-xs"
              >
                {productType.ativo ? 'Ativo' : 'Inativo'}
              </Badge>

              {productType.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {productType.descricao}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}