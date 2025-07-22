import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ReportsContent } from '@/components/reports/ReportsContent'
import { BarChart3 } from 'lucide-react'

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">
              Análise completa da sua situação financeira
            </p>
          </div>
        </div>

        <ReportsContent />
      </div>
    </DashboardLayout>
  )
}