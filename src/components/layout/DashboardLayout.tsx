import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Home, Receipt, PieChart, Settings, CreditCard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: string;
}

const navigation = [
  { name: 'Dashboard', href: '#dashboard', icon: Home, current: true },
  { name: 'Lançamentos', href: '#transactions', icon: Receipt, current: false },
  { name: 'Contas', href: '#accounts', icon: CreditCard, current: false },
  { name: 'Relatórios', href: '#reports', icon: PieChart, current: false },
  { name: 'Fornecedores', href: '#suppliers', icon: Users, current: false },
  { name: 'Configurações', href: '#settings', icon: Settings, current: false },
];

export function DashboardLayout({ children, currentPage = 'dashboard' }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-border">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Admin7
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.name.toLowerCase();
              
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.user_metadata?.name || user?.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="ml-3 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}