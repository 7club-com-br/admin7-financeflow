import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Search, Edit, Trash2, RefreshCw, Calendar } from 'lucide-react'
import { useRecurrences } from '@/hooks/useRecurrenceData'
import { RecurrenceForm } from './RecurrenceForm'
import { formatCurrency, formatDate } from '@/lib/utils'

export function RecurrenceList() {
  const [searchTerm, setSearchTerm] = useState('')
  const { 
    recurrences, 
    isLoading, 
    deleteRecurrence, 
    toggleRecurrence,
    generateRecurrences,
    isDeleting, 
    isToggling,
    isGenerating 
  } = useRecurrences()

  const filteredRecurrences = recurrences.filter(recurrence =>
    recurrence.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recurrence.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      'diario': 'Diário',
      'semanal': 'Semanal',
      'mensal': 'Mensal',
      'trimestral': 'Trimestral',
      'semestral': 'Semestral',
      'anual': 'Anual'
    }
    return labels[frequency as keyof typeof labels] || frequency
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar recorrências..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => generateRecurrences()}
          disabled={isGenerating}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Gerando...' : 'Gerar Lançamentos'}
        </Button>
      </div>

      {filteredRecurrences.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma recorrência encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Crie sua primeira recorrência para automatizar lançamentos.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRecurrences.map((recurrence) => (
            <Card key={recurrence.id} className={`transition-all ${!recurrence.ativa ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{recurrence.nome}</CardTitle>
                    <Badge variant={recurrence.tipo === 'receita' ? 'default' : 'secondary'}>
                      {recurrence.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </Badge>
                    <Badge variant="outline">
                      {getFrequencyLabel(recurrence.frequencia)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Ativo:</span>
                    <Switch
                      checked={recurrence.ativa}
                      onCheckedChange={(checked) => 
                        toggleRecurrence({ id: recurrence.id, ativa: checked })
                      }
                      disabled={isToggling}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-muted-foreground">{recurrence.descricao}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valor:</span>
                      <p className="font-medium">{formatCurrency(recurrence.valor)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Início:</span>
                      <p className="font-medium">{formatDate(recurrence.data_inicio)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gerados:</span>
                      <p className="font-medium">{recurrence.total_gerado}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Próxima:</span>
                      <p className="font-medium">
                        {recurrence.proxima_geracao ? formatDate(recurrence.proxima_geracao) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {recurrence.data_fim && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Data de fim: </span>
                      <span className="font-medium">{formatDate(recurrence.data_fim)}</span>
                    </div>
                  )}

                  {recurrence.limite_geracoes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Limite de gerações: </span>
                      <span className="font-medium">{recurrence.limite_geracoes}</span>
                    </div>
                  )}

                  {recurrence.observacoes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Observações: </span>
                      <span>{recurrence.observacoes}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <RecurrenceForm
                      recurrence={recurrence}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a recorrência "{recurrence.nome}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteRecurrence(recurrence.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}