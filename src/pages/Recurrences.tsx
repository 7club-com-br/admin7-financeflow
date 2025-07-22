import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RecurrenceForm } from '@/components/financial/RecurrenceForm'
import { RecurrenceList } from '@/components/financial/RecurrenceList'
import { Calendar, Repeat } from 'lucide-react'

export default function Recurrences() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Repeat className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Recorrências</h1>
              <p className="text-muted-foreground">
                Gerencie lançamentos automáticos e recorrentes
              </p>
            </div>
          </div>
          <RecurrenceForm />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recorrências Ativas
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Gerando lançamentos automaticamente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lançamentos Gerados
              </CardTitle>
              <Repeat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Total de lançamentos criados automaticamente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próximas Gerações
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Lançamentos pendentes para hoje
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suas Recorrências</CardTitle>
            <CardDescription>
              Configure lançamentos que se repetem automaticamente de acordo com a frequência definida.
              O sistema irá gerar os lançamentos automaticamente nas datas programadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecurrenceList />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}