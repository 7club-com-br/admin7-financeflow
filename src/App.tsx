import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index"
import Transactions from "./pages/Transactions"
import Categories from "./pages/Categories"
import Accounts from "./pages/Accounts"
import CostCenters from "./pages/CostCenters"
import Suppliers from "./pages/Suppliers"
import Recurrences from "./pages/Recurrences"
import Reports from "./pages/Reports"
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;