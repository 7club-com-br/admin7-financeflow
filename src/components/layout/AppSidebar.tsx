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
  Crown,
  Package,
  PieChart,
  Link
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

// Único item para o Dashboard
const dashboardItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
]

// Operações financeiras - incluindo Lançamentos
const financeiroItems = [
  { title: "Lançamentos", url: "/lancamentos", icon: Receipt },
  { title: "Recorrências", url: "/recorrencias", icon: Repeat },
  { title: "Contas Financeiras", url: "/contas", icon: CreditCard },
  { title: "Categorias", url: "/categorias", icon: TrendingUp },
  { title: "Centros de Custo", url: "/centros-custo", icon: Building2 },
]

// Fornecedores e catálogo juntos em um grupo mais significativo
const comercialItems = [
  { title: "Fornecedores", url: "/fornecedores", icon: Users },
  { title: "Produtos", url: "/produtos", icon: Package },
]

// Dados e análises juntos
const analisesItems = [
  { title: "Relatórios Financeiros", url: "/relatorios", icon: PieChart },
  { title: "Relatórios de Licenças", url: "/relatorios-licencas", icon: BarChart3 },
]

// Licenciamento separado conforme solicitado
const licencasItems = [
  { title: "Licenças", url: "/licencas", icon: Crown },
]

// Integrações
const integracoesItems = [
  { title: "Integração Kommo", url: "/integracoes/kommo", icon: Link },
]

// Configurações administrativas
const sistemaItems = [
  { title: "Configurações", url: "/configuracoes", icon: Settings },
]

export function AppSidebar() {
  const { state, setOpen } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"

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
              <div className="flex-1">
                <h2 className="text-lg font-bold text-sidebar-primary-foreground">Admin</h2>
              </div>
            )}
          </div>
        </div>
        
        {/* Dashboard */}
        <SidebarGroup className="px-2 mt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/"} className={getNavCls}>
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

        {/* Comercial */}
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Comercial</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comercialItems.map((item) => (
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

        {/* Análises */}
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Análises</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analisesItems.map((item) => (
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

        {/* Integrações */}
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Integrações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {integracoesItems.map((item) => (
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