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
]

const ferramentasItems = [
  { title: "Recorrências", url: "/recorrencias", icon: Repeat },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
]

const licencasItems = [
  { title: "Licenças", url: "/licencas", icon: Crown },
  { title: "Relatórios de Licenças", url: "/relatorios-licencas", icon: BarChart3 },
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
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50 text-sidebar-foreground"

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="bg-sidebar">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-sidebar-border bg-sidebar-primary">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/845de12e-ad02-47ec-ab1e-579893db3008.png" 
              alt="7Club Logo" 
              className="h-8 w-auto"
            />
            {state === "expanded" && (
              <div>
                <h2 className="text-lg font-bold text-sidebar-primary-foreground">7Club</h2>
                <p className="text-xs text-sidebar-primary-foreground/80">Sistema Financeiro</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Principal */}
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Principal</SidebarGroupLabel>
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
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Financeiro</SidebarGroupLabel>
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

        {/* Catálogo */}
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Catálogo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {catalogoItems.map((item) => (
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
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Ferramentas</SidebarGroupLabel>
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

        {/* Licenças */}
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Licenças</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {licencasItems.map((item) => (
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
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Sistema</SidebarGroupLabel>
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