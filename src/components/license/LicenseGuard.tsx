import React from 'react';
import { useLicenseContext } from '@/contexts/LicenseContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LicenseGuardProps {
  children: React.ReactNode;
  feature?: string;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function LicenseGuard({ 
  children, 
  feature, 
  fallback, 
  showUpgrade = true 
}: LicenseGuardProps) {
  const { license, hasFeature, isExpired } = useLicenseContext();
  const navigate = useNavigate();

  // Se a licença expirou, mostrar alerta
  if (isExpired()) {
    return (
      <Alert className="border-destructive bg-destructive/10">
        <Shield className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Sua licença expirou. Renove para continuar usando o sistema.</span>
          {showUpgrade && (
            <Button 
              size="sm" 
              onClick={() => navigate('/licenses')}
              className="ml-4"
            >
              <Crown className="w-4 h-4 mr-2" />
              Renovar Agora
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Se um recurso específico foi solicitado e não está disponível
  if (feature && !hasFeature(feature)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="border-warning bg-warning/10">
        <Zap className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Este recurso não está disponível no seu plano atual. 
            Faça upgrade para acessá-lo.
          </span>
          {showUpgrade && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/licenses')}
              className="ml-4"
            >
              <Crown className="w-4 h-4 mr-2" />
              Ver Planos
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}