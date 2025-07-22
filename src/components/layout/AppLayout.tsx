import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { LicenseStatus } from "@/components/license/LicenseStatus"
import { User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth()

  const handleSignOut = () => {
    signOut()
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/845de12e-ad02-47ec-ab1e-579893db3008.png" 
                  alt="7Club Logo" 
                  className="h-6 w-auto"
                />
                <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  7Club Financial
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LicenseStatus />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {user?.email || 'Usuário'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}