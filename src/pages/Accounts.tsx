import { useState } from "react"
import { Plus, Edit, Trash2, CreditCard, Wallet, Building2 } from "lucide-react"

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

import { useAccounts, Account, CreateAccountData } from "@/hooks/useCatalogData"
import { useForm } from "react-hook-form"

const accountTypes = [
  { value: 'conta_bancaria', label: 'Conta Bancária', icon: Building2 },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: CreditCard },
  { value: 'caixa', label: 'Caixa', icon: Wallet },
  { value: 'poupanca', label: 'Poupança', icon: Building2 },
  { value: 'investimento', label: 'Investimento', icon: Building2 }
]

interface AccountFormProps {
  onSubmit: (data: CreateAccountData) => void
  defaultValues?: Account
  isLoading?: boolean
}

function AccountForm({ onSubmit, defaultValues, isLoading }: AccountFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateAccountData>({
    defaultValues: defaultValues ? {
      nome: defaultValues.nome,
      tipo: defaultValues.tipo,
      banco: defaultValues.banco || '',
      agencia: defaultValues.agencia || '',
      conta: defaultValues.conta || '',
      saldo_inicial: defaultValues.saldo_inicial,
      observacoes: defaultValues.observacoes || ''
    } : {
      tipo: 'conta_bancaria',
      saldo_inicial: 0
    }
  })

  const selectedType = watch('tipo')
  const needsBankInfo = ['conta_bancaria', 'poupanca'].includes(selectedType)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            {...register("nome", { required: "Nome é obrigatório" })}
            placeholder="Ex: Conta Corrente Banco X"
          />
          {errors.nome && (
            <p className="text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Tipo *</Label>
          <Select onValueChange={(value) => setValue('tipo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {accountTypes.map((type) => {
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
      </div>

      {needsBankInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="banco">Banco</Label>
            <Input
              id="banco"
              {...register("banco")}
              placeholder="Ex: Banco do Brasil"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agencia">Agência</Label>
            <Input
              id="agencia"
              {...register("agencia")}
              placeholder="Ex: 1234-5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conta">Conta</Label>
            <Input
              id="conta"
              {...register("conta")}
              placeholder="Ex: 12345-6"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="saldo_inicial">Saldo Inicial</Label>
        <Input
          id="saldo_inicial"
          type="number"
          step="0.01"
          {...register("saldo_inicial", { 
            required: "Saldo inicial é obrigatório",
            valueAsNumber: true
          })}
          placeholder="0,00"
        />
        {errors.saldo_inicial && (
          <p className="text-sm text-red-600">{errors.saldo_inicial.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          {...register("observacoes")}
          placeholder="Informações adicionais sobre a conta..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : (defaultValues ? 'Atualizar' : 'Criar')} Conta
      </Button>
    </form>
  )
}

export default function Accounts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const {
    accounts,
    isLoading,
    createAccount,
    updateAccount,
    deleteAccount,
    toggleActive
  } = useAccounts()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTypeLabel = (type: string) => {
    return accountTypes.find(t => t.value === type)?.label || type
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = accountTypes.find(t => t.value === type)
    return typeConfig ? typeConfig.icon : CreditCard
  }

  const handleSubmit = async (data: CreateAccountData) => {
    if (editingAccount) {
      await updateAccount.mutateAsync({
        id: editingAccount.id,
        data
      })
    } else {
      await createAccount.mutateAsync(data)
    }
    
    setIsDialogOpen(false)
    setEditingAccount(null)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await deleteAccount.mutateAsync(id)
  }

  const handleToggleActive = async (id: string, ativa: boolean) => {
    await toggleActive.mutateAsync({ id, ativa })
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (account.banco || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || account.tipo === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contas Financeiras</h2>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias, cartões e caixas
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </DialogTitle>
            </DialogHeader>
            <AccountForm
              onSubmit={handleSubmit}
              defaultValues={editingAccount || undefined}
              isLoading={createAccount.isPending || updateAccount.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar contas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:max-w-sm"
            />
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {accountTypes.map((type) => (
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
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">Nenhuma conta encontrada</p>
              <p className="text-sm">
                {searchTerm || typeFilter !== "all" 
                  ? "Tente ajustar os filtros"
                  : "Comece criando sua primeira conta financeira"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Saldo Atual</TableHead>
                    <TableHead>Banco/Detalhes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => {
                    const Icon = getTypeIcon(account.tipo)
                    return (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{account.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getTypeLabel(account.tipo)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            account.saldo_atual >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(account.saldo_atual)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {account.banco ? (
                            <div className="text-sm">
                              <div>{account.banco}</div>
                              {account.agencia && account.conta && (
                                <div className="text-muted-foreground">
                                  Ag: {account.agencia} | Cc: {account.conta}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={account.ativa}
                              onCheckedChange={(checked) => handleToggleActive(account.id, checked)}
                            />
                            <span className="text-sm">
                              {account.ativa ? 'Ativa' : 'Inativa'}
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
                              <DropdownMenuItem onClick={() => handleEdit(account)}>
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
                                      Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(account.id)}
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