import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AppAlertProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function AppAlert({ type = 'info', title, children, action }: AppAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Alert variant={type === 'error' ? 'destructive' : 'default'}>
      {getIcon()}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>
        {children}
        {action && <div className="mt-2">{action}</div>}
      </AlertDescription>
    </Alert>
  );
}
