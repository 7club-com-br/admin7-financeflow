import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LicenseProvider } from "@/contexts/LicenseContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index"
import Transactions from "./pages/Transactions"
import Categories from "./pages/Categories"
import Accounts from "./pages/Accounts"
import CostCenters from "./pages/CostCenters"
import Suppliers from "./pages/Suppliers"
import Products from "./pages/Products"
import Recurrences from "./pages/Recurrences"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import Licenses from "./pages/Licenses"
import LicenseReports from "./pages/LicenseReports"
import OAuthCallback from "./pages/OAuthCallback"
import KommoIntegration from "./pages/KommoIntegration"
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  console.log('[ProtectedRoute] Renderizado - loading:', loading, 'user:', !!user);
  
  if (loading) {
    console.log('[ProtectedRoute] Mostrando loading');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log('[ProtectedRoute] Sem usuário, mostrando AuthForm');
    return <AuthForm />;
  }
  
  console.log('[ProtectedRoute] Usuário autenticado, renderizando children');
  return <>{children}</>;
}

function App() {
  console.log('[App] Renderizando App component');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LicenseProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthForm />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Index />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/lancamentos" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Transactions />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/categorias" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Categories />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/contas" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Accounts />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/centros-custo" element={
                <ProtectedRoute>
                  <AppLayout>
                    <CostCenters />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/produtos" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Products />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/fornecedores" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Suppliers />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/recorrencias" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Recurrences />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Reports />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/licencas" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Licenses />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/relatorios-licencas" element={
                <ProtectedRoute>
                  <AppLayout>
                    <LicenseReports />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/integracoes/kommo" element={
                <ProtectedRoute>
                  <AppLayout>
                    <KommoIntegration />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LicenseProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;