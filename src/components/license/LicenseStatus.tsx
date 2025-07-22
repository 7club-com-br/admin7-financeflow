import React from 'react';
import { useLicenseContext } from '@/contexts/LicenseContext';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Calendar, Users, FileText, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function LicenseStatus() {
  const { license, isExpiringSoon, isExpired } = useLicenseContext();
  const navigate = useNavigate();

  if (!license) {
    return null;
  }

  const getStatusColor = () => {
    if (isExpired()) return 'destructive';
    if (isExpiringSoon()) return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (isExpired()) return <Shield className="w-4 h-4" />;
    if (isExpiringSoon()) return <Calendar className="w-4 h-4" />;
    return <Crown className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={getStatusColor()} 
        className="flex items-center gap-1"
      >
        {getStatusIcon()}
        {license.plano_nome}
      </Badge>
      
      {(isExpired() || isExpiringSoon()) && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate('/licenses')}
          className="text-xs"
        >
          {isExpired() ? 'Renovar' : 'Gerenciar'}
        </Button>
      )}
    </div>
  );
}

export function LicenseDetails() {
  const { license } = useLicenseContext();

  if (!license) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-background">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Expira em</p>
          <p className="font-medium">{license.dias_restantes} dias</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Usuários</p>
          <p className="font-medium">{license.limite_usuarios}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Lançamentos</p>
          <p className="font-medium">{license.limite_lancamentos}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Produtos</p>
          <p className="font-medium">{license.limite_produtos}</p>
        </div>
      </div>
    </div>
  );
}