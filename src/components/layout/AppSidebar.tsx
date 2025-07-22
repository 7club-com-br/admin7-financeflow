import { useState } from "react"
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  Building2, 
  Users, 
  Repeat, 
  BarChart3, 
  Settings,
  TrendingUp,
  TrendingDown,
  Crown,
  Package,
  Truck
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const principalItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Lançamentos", url: "/lancamentos", icon: Receipt },
]

const financeiroItems = [
  { title: "Contas Financeiras", url: "/contas", icon: CreditCard },
  { title: "Categorias", url: "/categorias", icon: TrendingUp },
  { title: "Centros de Custo", url: "/centros-custo", icon: Building2 },
  { title: "Fornecedores", url: "/fornecedores", icon: Users },
]

const catalogoItems = [
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Fornecedores", url: "/fornecedores", icon: Truck },
]

const ferramentasItems = [
  { title: "Recorrências", url: "/recorrencias", icon: Repeat },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
]

const sistemaItems = [
  { title: "Configurações", url: "/configuracoes", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/845de12e-ad02-47ec-ab1e-579893db3008.png" 
              alt="7Club Logo" 
              className="h-8 w-auto"
            />
            {state === "expanded" && (
              <div>
                <h2 className="text-lg font-bold text-white">7Club</h2>
                <p className="text-xs text-blue-100">Sistema Financeiro</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {principalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Financeiro */}
        <SidebarGroup>
          <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financeiroItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Ferramentas */}
        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ferramentasItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sistema */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sistemaItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}