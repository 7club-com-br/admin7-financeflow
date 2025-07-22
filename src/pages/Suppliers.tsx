import { useState } from "react"
import { Plus, Edit, Trash2, User, Building } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"

import { useSuppliers, Supplier, CreateSupplierData } from "@/hooks/useCatalogData"
import { useForm } from "react-hook-form"

const documentTypes = [
  { value: 'cpf', label: 'CPF', icon: User },
  { value: 'cnpj', label: 'CNPJ', icon: Building },
  { value: 'rg', label: 'RG', icon: User },
  { value: 'outro', label: 'Outro', icon: User }
]

interface SupplierFormProps {
  onSubmit: (data: CreateSupplierData) => void
  defaultValues?: Supplier
  isLoading?: boolean
}

function SupplierForm({ onSubmit, defaultValues, isLoading }: SupplierFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateSupplierData>({
    defaultValues: defaultValues ? {
      nome: defaultValues.nome,
      tipo_documento: defaultValues.tipo_documento,
      documento: defaultValues.documento || '',
      email: defaultValues.email || '',
      telefone: defaultValues.telefone || '',
      endereco: defaultValues.endereco || '',
      observacoes: defaultValues.observacoes || ''
    } : {
      tipo_documento: 'cpf'
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome/Razão Social *</Label>
        <Input
          id="nome"
          {...register("nome", { required: "Nome é obrigatório" })}
          placeholder="Ex: João Silva / Empresa X Ltda"
        />
        {errors.nome && (
          <p className="text-sm text-red-600">{errors.nome.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de Documento</Label>
          <Select onValueChange={(value) => setValue('tipo_documento', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => {
                const Icon = type.icon
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="documento">Número do Documento</Label>
          <Input
            id="documento"
            {...register("documento")}
            placeholder="Ex: 123.456.789-00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="exemplo@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            {...register("telefone")}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Textarea
          id="endereco"
          {...register("endereco")}
          placeholder="Endereço completo..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          {...register("observacoes")}
          placeholder="Informações adicionais sobre o fornecedor..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : (defaultValues ? 'Atualizar' : 'Criar')} Fornecedor
      </Button>
    </form>
  )
}

export default function Suppliers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const {
    suppliers,
    isLoading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleActive
  } = useSuppliers()

  const getTypeLabel = (type: string) => {
    return documentTypes.find(t => t.value === type)?.label || type.toUpperCase()
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = documentTypes.find(t => t.value === type)
    return typeConfig ? typeConfig.icon : User
  }

  const handleSubmit = async (data: CreateSupplierData) => {
    if (editingSupplier) {
      await updateSupplier.mutateAsync({
        id: editingSupplier.id,
        data
      })
    } else {
      await createSupplier.mutateAsync(data)
    }
    
    setIsDialogOpen(false)
    setEditingSupplier(null)
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await deleteSupplier.mutateAsync(id)
  }

  const handleToggleActive = async (id: string, ativo: boolean) => {
    await toggleActive.mutateAsync({ id, ativo })
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.documento || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || supplier.tipo_documento === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fornecedores</h2>
          <p className="text-muted-foreground">
            Gerencie seus fornecedores e prestadores de serviço
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </DialogTitle>
            </DialogHeader>
            <SupplierForm
              onSubmit={handleSubmit}
              defaultValues={editingSupplier || undefined}
              isLoading={createSupplier.isPending || updateSupplier.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:max-w-sm"
            />
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">Nenhum fornecedor encontrado</p>
              <p className="text-sm">
                {searchTerm || typeFilter !== "all" 
                  ? "Tente ajustar os filtros"
                  : "Comece criando seu primeiro fornecedor"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => {
                    const Icon = getTypeIcon(supplier.tipo_documento)
                    return (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{supplier.nome}</div>
                              {supplier.observacoes && (
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {supplier.observacoes}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {supplier.documento ? (
                            <div>
                              <Badge variant="outline" className="mb-1">
                                {getTypeLabel(supplier.tipo_documento)}
                              </Badge>
                              <div className="text-sm font-mono">
                                {supplier.documento}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {supplier.email && (
                              <div className="text-sm">{supplier.email}</div>
                            )}
                            {supplier.telefone && (
                              <div className="text-sm text-muted-foreground">{supplier.telefone}</div>
                            )}
                            {!supplier.email && !supplier.telefone && (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={supplier.ativo}
                              onCheckedChange={(checked) => handleToggleActive(supplier.id, checked)}
                            />
                            <span className="text-sm">
                              {supplier.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(supplier.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}