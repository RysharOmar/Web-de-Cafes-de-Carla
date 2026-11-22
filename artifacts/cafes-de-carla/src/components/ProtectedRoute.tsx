import type { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/context/AuthContext';

type ProtectedRouteProps = {
  requiredRole?: 'admin' | 'cocina';
  children: ReactNode;
};

export default function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="protected-loading" role="status">
        <span className="serif">Cafés de Carla</span>
        <p>Comprobando tu sesión…</p>
      </div>
    );
  }

  if (!session) return <Redirect to="/login" />;

  if (requiredRole && role !== requiredRole) {
    return <Redirect to="/acceso-denegado" />;
  }

  return <>{children}</>;
}
