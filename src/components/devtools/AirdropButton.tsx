import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSolana } from '@/contexts/SolanaProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { Droplets, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AirdropButtonProps {
  className?: string;
  showCard?: boolean;
  lamports?: number;
}

export function AirdropButton({ 
  className = '', 
  showCard = false, 
  lamports = 1000000000 // 1 SOL
}: AirdropButtonProps) {
  const { publicKey, connected } = useWallet();
  const { requestAirdrop, network, connection } = useSolana();
  const [isRequesting, setIsRequesting] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  // Check if airdrop is available (not on mainnet)
  const isAirdropAvailable = network !== 'Mainnet Beta';

  const handleAirdrop = async () => {
    if (!connected || !publicKey || !isAirdropAvailable) return;

    setIsRequesting(true);
    try {
      const signature = await requestAirdrop(lamports);
      if (signature) {
        toast.success(`Airdrop successful! Signature: ${signature.slice(0, 8)}...`);
        // Update balance after airdrop
        const newBalance = await connection.getBalance(publicKey);
        setBalance(newBalance / 1000000000); // Convert to SOL
      } else {
        toast.error('Airdrop failed. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Airdrop error:', error);
      toast.error(error instanceof Error ? error.message : 'Airdrop failed');
    } finally {
      setIsRequesting(false);
    }
  };

  const loadBalance = async () => {
    if (!connected || !publicKey) return;
    
    try {
      const balanceLamports = await connection.getBalance(publicKey);
      setBalance(balanceLamports / 1000000000); // Convert to SOL
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  React.useEffect(() => {
    if (connected && publicKey) {
      loadBalance();
    }
  }, [connected, publicKey]);

  if (!isAirdropAvailable) {
    return null; // Don't show on mainnet
  }

  if (showCard) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            <span>Devnet Faucet</span>
            <Badge variant="outline">{network}</Badge>
          </CardTitle>
          <CardDescription>
            Request SOL tokens for testing on {network.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {balance !== null && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Current Balance:</span>
              <span className="text-lg font-bold text-gray-900">{balance.toFixed(4)} SOL</span>
            </div>
          )}
          
          <Button
            onClick={handleAirdrop}
            disabled={!connected || isRequesting}
            className="w-full"
            size="lg"
          >
            {isRequesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Requesting Airdrop...
              </>
            ) : (
              <>
                <Droplets className="h-4 w-4 mr-2" />
                Request {lamports / 1000000000} SOL
              </>
            )}
          </Button>
          
          {!connected && (
            <p className="text-sm text-gray-600 text-center">
              Connect your wallet to request airdrop
            </p>
          )}
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Airdrop is only available on devnet and testnet</p>
            <p>• Use airdropped SOL for testing bounty creation and transactions</p>
            <p>• Maximum 2 SOL per request</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={handleAirdrop}
      disabled={!connected || isRequesting}
      variant="outline"
      size="sm"
      className={className}
    >
      {isRequesting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Requesting...
        </>
      ) : (
        <>
          <Droplets className="h-4 w-4 mr-2" />
          Airdrop SOL
        </>
      )}
    </Button>
  );
}
