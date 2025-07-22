import { useState } from "react";
import { Plus, Package, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm } from "@/components/catalog/ProductForm";
import { ProductList } from "@/components/catalog/ProductList";
import { ProductTypeForm } from "@/components/catalog/ProductTypeForm";
import { ProductTypeList } from "@/components/catalog/ProductTypeList";
import { ExchangeRateCard } from "@/components/catalog/ExchangeRateCard";

export default function Products() {
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProductTypeForm, setShowProductTypeForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingProductType, setEditingProductType] = useState(null);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e tipos de produtos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ExchangeRateCard />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Kommo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">com preço automático</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="types">Tipos de Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lista de Produtos</h2>
            <Button onClick={() => setShowProductForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>

          <ProductList 
            onEdit={(product) => {
              setEditingProduct(product);
              setShowProductForm(true);
            }}
          />
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tipos de Produtos</h2>
            <Button onClick={() => setShowProductTypeForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Tipo
            </Button>
          </div>

          <ProductTypeList 
            onEdit={(type) => {
              setEditingProductType(type);
              setShowProductTypeForm(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSuccess={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {showProductTypeForm && (
        <ProductTypeForm
          productType={editingProductType}
          onSuccess={() => {
            setShowProductTypeForm(false);
            setEditingProductType(null);
          }}
          onCancel={() => {
            setShowProductTypeForm(false);
            setEditingProductType(null);
          }}
        />
      )}
    </div>
  );
}