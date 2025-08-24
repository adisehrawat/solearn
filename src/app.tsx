import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProviders } from './contexts/WalletContext';
import { AppProvider } from './contexts/AppContext';
import { SolanaProvider } from './contexts/SolanaProvider';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { SignIn } from './pages/SignIn';
import { ClientDashboard } from './pages/ClientDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { BountyDetail } from './pages/BountyDetail';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { useWallet } from '@solana/wallet-adapter-react';
import { useApp } from './contexts/AppContext';

function ProtectedRoute({ children, requiredRole }: { 
  children: React.ReactNode; 
  requiredRole?: string;
}) {
  const connected = useWallet();
  const { userRole } = useApp();

  if (!connected) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route 
        path="/client-dashboard" 
        element={
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user-dashboard" 
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/bounty/:id" 
        element={
          <ProtectedRoute>
            <BountyDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProviders>
      <SolanaProvider>
        <AppProvider>
          <Router>
            <Layout>
              <AppRoutes />
            </Layout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
              }}
            />
          </Router>
        </AppProvider>
      </SolanaProvider>
    </AppProviders>
  );
}

export default App;