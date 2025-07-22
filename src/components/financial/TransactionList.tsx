import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  MoreHorizontal, 
  Edit, 
  Trash2,
  CheckCircle,
  Eye,
  Filter,
  Search,
  Download,
  CreditCard,
  XCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { PaymentSelector } from "@/components/payments/PaymentSelector"

import { FinancialTransaction } from "@/hooks/useFinancialData"

interface TransactionListProps {
  transactions: FinancialTransaction[]
  isLoading: boolean
  onEdit: (transaction: FinancialTransaction) => void
  onDelete: (id: string) => void
  onMarkAsPaid: (id: string) => void
}

export function TransactionList({ 
  transactions, 
  isLoading, 
  onEdit, 
  onDelete, 
  onMarkAsPaid 
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showPayment, setShowPayment] = useState<string | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pago: { variant: 'default' as const, label: 'Pago', className: 'bg-green-100 text-green-800' },
      pendente: { variant: 'secondary' as const, label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      cancelado: { variant: 'destructive' as const, label: 'Cancelado', className: 'bg-red-100 text-red-800' },
      atrasado: { variant: 'destructive' as const, label: 'Atrasado', className: 'bg-red-100 text-red-800' }
    }

    const config = variants[status as keyof typeof variants] || variants.pendente
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.categoria?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.conta?.nome.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesType = typeFilter === "all" || transaction.tipo === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Lançamentos Financeiros</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">Nenhum lançamento encontrado</p>
            <p className="text-sm">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                ? "Tente ajustar os filtros para ver mais resultados"
                : "Comece criando seu primeiro lançamento financeiro"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.descricao}
                      {transaction.numero_documento && (
                        <div className="text-xs text-muted-foreground">
                          Doc: {transaction.numero_documento}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.tipo === 'receita' ? 'default' : 'secondary'}>
                        {transaction.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-medium ${
                      transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.tipo === 'receita' ? '+' : '-'} {formatCurrency(transaction.valor)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.categoria && (
                          <>
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: transaction.categoria.cor }}
                            />
                            <span className="text-sm">{transaction.categoria.nome}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{transaction.conta?.nome}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(transaction)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          
                          {transaction.status === 'pendente' && transaction.tipo === 'receita' && (
                            <DropdownMenuItem onClick={() => setShowPayment(transaction.id)}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Processar Pagamento
                            </DropdownMenuItem>
                          )}

                          {transaction.status === 'pendente' && (
                            <DropdownMenuItem onClick={() => onMarkAsPaid(transaction.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Pago
                            </DropdownMenuItem>
                          )}
                          
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
                                  Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => onDelete(transaction.id)}
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

        {/* Modal de Pagamento */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Processar Pagamento</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPayment(null)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              {(() => {
                const transaction = filteredTransactions.find(t => t.id === showPayment)
                return transaction ? (
                  <PaymentSelector
                    amount={transaction.valor}
                    description={transaction.descricao}
                    transactionId={transaction.id}
                    onSuccess={() => {
                      setShowPayment(null)
                      // A transação será atualizada via webhook
                    }}
                    onError={(error) => {
                      console.error('Erro no pagamento:', error)
                    }}
                  />
                ) : null
              })()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}