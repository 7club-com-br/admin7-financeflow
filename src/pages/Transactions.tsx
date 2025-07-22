import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { TransactionForm } from "@/components/financial/TransactionForm"
import { TransactionList } from "@/components/financial/TransactionList"
import { useFinancialTransactions, FinancialTransaction, CreateTransactionData } from "@/hooks/useFinancialData"

export default function Transactions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null)

  const {
    transactions,
    isLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid
  } = useFinancialTransactions()

  const handleSubmit = async (data: CreateTransactionData) => {
    if (editingTransaction) {
      await updateTransaction.mutateAsync({
        id: editingTransaction.id,
        data
      })
    } else {
      await createTransaction.mutateAsync(data)
    }
    
    setIsDialogOpen(false)
    setEditingTransaction(null)
  }

  const handleEdit = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await deleteTransaction.mutateAsync(id)
  }

  const handleMarkAsPaid = async (id: string) => {
    await markAsPaid.mutateAsync(id)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTransaction(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lançamentos Financeiros</h2>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              onSubmit={handleSubmit}
              defaultValues={editingTransaction ? {
                tipo: editingTransaction.tipo,
                descricao: editingTransaction.descricao,
                valor: editingTransaction.valor,
                data_vencimento: editingTransaction.data_vencimento,
                categoria_id: editingTransaction.categoria_id,
                conta_id: editingTransaction.conta_id,
                centro_custo_id: editingTransaction.centro_custo_id || undefined,
                fornecedor_id: editingTransaction.fornecedor_id || undefined,
                numero_documento: editingTransaction.numero_documento || undefined,
                observacoes: editingTransaction.observacoes || undefined,
                tags: editingTransaction.tags || undefined
              } : undefined}
              isLoading={createTransaction.isPending || updateTransaction.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <TransactionList
        transactions={transactions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </div>
  )
}