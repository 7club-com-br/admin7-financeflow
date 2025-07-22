import { useState } from "react"
import { useForm } from "react-hook-form"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { CreateTransactionData, useCategories, useAccounts, useCostCenters, useSuppliers } from "@/hooks/useFinancialData"

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionData) => void
  defaultValues?: Partial<CreateTransactionData> & { id?: string }
  isLoading?: boolean
}

export function TransactionForm({ onSubmit, defaultValues, isLoading }: TransactionFormProps) {
  const [date, setDate] = useState<Date>(
    defaultValues?.data_vencimento ? new Date(defaultValues.data_vencimento) : new Date()
  )
  const [tags, setTags] = useState<string[]>(defaultValues?.tags || [])
  const [newTag, setNewTag] = useState("")

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateTransactionData>({
    defaultValues: {
      tipo: 'despesa',
      ...defaultValues
    }
  })

  const { data: categories = [] } = useCategories()
  const { data: accounts = [] } = useAccounts()
  const { data: costCenters = [] } = useCostCenters()
  const { data: suppliers = [] } = useSuppliers()

  const tipo = watch('tipo')

  const filteredCategories = categories.filter(cat => cat.tipo === tipo)

  const handleFormSubmit = (data: CreateTransactionData) => {
    onSubmit({
      ...data,
      data_vencimento: format(date, 'yyyy-MM-dd'),
      tags: tags.length > 0 ? tags : undefined,
      valor: Number(data.valor)
    })
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {defaultValues?.id ? 'Editar Lançamento' : 'Novo Lançamento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <RadioGroup
              value={tipo}
              onValueChange={(value) => setValue('tipo', value as 'receita' | 'despesa')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="receita" id="receita" />
                <Label htmlFor="receita" className="text-green-600">Receita</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="despesa" id="despesa" />
                <Label htmlFor="despesa" className="text-red-600">Despesa</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              {...register("descricao", { required: "Descrição é obrigatória" })}
              placeholder="Ex: Venda de produto, Pagamento fornecedor..."
            />
            {errors.descricao && (
              <p className="text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              {...register("valor", { 
                required: "Valor é obrigatório",
                min: { value: 0.01, message: "Valor deve ser maior que zero" }
              })}
              placeholder="0,00"
            />
            {errors.valor && (
              <p className="text-sm text-red-600">{errors.valor.message}</p>
            )}
          </div>

          {/* Data de Vencimento */}
          <div className="space-y-2">
            <Label>Data de Vencimento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select onValueChange={(value) => setValue('categoria_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.cor }}
                        />
                        {category.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conta */}
            <div className="space-y-2">
              <Label>Conta Financeira *</Label>
              <Select onValueChange={(value) => setValue('conta_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Centro de Custo */}
            <div className="space-y-2">
              <Label>Centro de Custo</Label>
              <Select onValueChange={(value) => setValue('centro_custo_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um centro de custo" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fornecedor (apenas para despesas) */}
            {tipo === 'despesa' && (
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select onValueChange={(value) => setValue('fornecedor_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Número do Documento */}
          <div className="space-y-2">
            <Label htmlFor="numero_documento">Número do Documento</Label>
            <Input
              id="numero_documento"
              {...register("numero_documento")}
              placeholder="Ex: NF-001, Boleto 12345..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Digite uma tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register("observacoes")}
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Salvando...' : (defaultValues?.id ? 'Atualizar' : 'Criar')} Lançamento
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}