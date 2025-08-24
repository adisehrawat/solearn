// React import not needed with new JSX transform
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Wallet, User, LogOut } from 'lucide-react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { AirdropButton } from '@/components/devtools/AirdropButton';
import { useSolana } from '@/contexts/SolanaProvider';

export function Header() {
  const { connected, publicKey, disconnect } = useSolanaWallet();
  const { userRole } = useApp();
  const { network } = useSolana();
  const navigate = useNavigate();

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
    
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
            <span className="text-xl font-bold">solEARN</span>
          </motion.div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {connected && (
            <>
              <Link
                to={userRole === 'client' ? '/client-dashboard' : '/user-dashboard'}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Profile
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          {connected ? (
            <>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                </span>
              </div>
              {(network === 'Devnet' || network === 'Localnet') && (
                <AirdropButton className="hidden sm:flex" />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="hidden sm:flex"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Disconnect</span>
              </Button>
              
            </>
          ) : (
            <Button onClick={() => navigate('/signin')}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}