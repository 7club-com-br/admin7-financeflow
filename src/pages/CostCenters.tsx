import { useState } from "react"
import { Plus, Edit, Trash2, Building2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"

import { useCostCenters, CostCenter, CreateCostCenterData } from "@/hooks/useCatalogData"
import { useForm } from "react-hook-form"

interface CostCenterFormProps {
  onSubmit: (data: CreateCostCenterData) => void
  defaultValues?: CostCenter
  isLoading?: boolean
}

function CostCenterForm({ onSubmit, defaultValues, isLoading }: CostCenterFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCostCenterData>({
    defaultValues: defaultValues ? {
      nome: defaultValues.nome,
      codigo: defaultValues.codigo || '',
      descricao: defaultValues.descricao || ''
    } : {}
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            {...register("nome", { required: "Nome é obrigatório" })}
            placeholder="Ex: Departamento de TI"
          />
          {errors.nome && (
            <p className="text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigo">Código</Label>
          <Input
            id="codigo"
            {...register("codigo")}
            placeholder="Ex: CC001, TI-01"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          {...register("descricao")}
          placeholder="Descrição do centro de custo..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : (defaultValues ? 'Atualizar' : 'Criar')} Centro de Custo
      </Button>
    </form>
  )
}

export default function CostCenters() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const {
    costCenters,
    isLoading,
    createCostCenter,
    updateCostCenter,
    deleteCostCenter,
    toggleActive
  } = useCostCenters()

  const handleSubmit = async (data: CreateCostCenterData) => {
    if (editingCostCenter) {
      await updateCostCenter.mutateAsync({
        id: editingCostCenter.id,
        data
      })
    } else {
      await createCostCenter.mutateAsync(data)
    }
    
    setIsDialogOpen(false)
    setEditingCostCenter(null)
  }

  const handleEdit = (costCenter: CostCenter) => {
    setEditingCostCenter(costCenter)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await deleteCostCenter.mutateAsync(id)
  }

  const handleToggleActive = async (id: string, ativo: boolean) => {
    await toggleActive.mutateAsync({ id, ativo })
  }

  const filteredCostCenters = costCenters.filter(costCenter => {
    const matchesSearch = costCenter.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (costCenter.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (costCenter.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Centros de Custo</h2>
          <p className="text-muted-foreground">
            Organize suas despesas por departamentos ou projetos
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Centro de Custo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCostCenter ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
              </DialogTitle>
            </DialogHeader>
            <CostCenterForm
              onSubmit={handleSubmit}
              defaultValues={editingCostCenter || undefined}
              isLoading={createCostCenter.isPending || updateCostCenter.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder="Buscar centros de custo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredCostCenters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">Nenhum centro de custo encontrado</p>
              <p className="text-sm">
                {searchTerm 
                  ? "Tente ajustar os filtros"
                  : "Comece criando seu primeiro centro de custo"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCostCenters.map((costCenter) => (
                    <TableRow key={costCenter.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{costCenter.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {costCenter.codigo || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {costCenter.descricao || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={costCenter.ativo}
                            onCheckedChange={(checked) => handleToggleActive(costCenter.id, checked)}
                          />
                          <span className="text-sm">
                            {costCenter.ativo ? 'Ativo' : 'Inativo'}
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
                            <DropdownMenuItem onClick={() => handleEdit(costCenter)}>
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
                                    Tem certeza que deseja excluir este centro de custo? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(costCenter.id)}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}